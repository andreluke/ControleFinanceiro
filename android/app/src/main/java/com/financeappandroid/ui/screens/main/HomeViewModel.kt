package com.financeappandroid.ui.screens.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.financeappandroid.domain.model.MonthlySummary
import com.financeappandroid.domain.model.Summary
import com.financeappandroid.domain.model.Transaction
import com.financeappandroid.domain.repository.SummaryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = false,
    val summary: Summary? = null,
    val monthlyHistory: List<MonthlySummary> = emptyList(),
    val recentTransactions: List<Transaction> = emptyList(),
    val error: String? = null,
    val formattedBalance: String = "R$ 0,00",
    val formattedIncome: String = "R$ 0,00",
    val formattedExpense: String = "R$ 0,00",
    val balanceValue: Double = 0.0,
    val changeValue: Double = 0.0,
    val changePercent: Double = 0.0
)

val userName: String? = null

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val summaryRepository: SummaryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadSummary()
    }

    fun loadSummary(month: String? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            summaryRepository.getSummary(month).fold(
                onSuccess = { summary ->
                    val formatter = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))
                    val changeValue = summary.totalIncome - summary.totalExpense
                    val changePercent = if (summary.totalExpense != 0.0) {
                        ((summary.totalIncome - summary.totalExpense) / summary.totalExpense) * 100
                    } else {
                        0.0
                    }
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        summary = summary,
                        recentTransactions = summary.recentTransactions,
                        formattedBalance = formatter.format(summary.balance),
                        formattedIncome = formatter.format(summary.totalIncome),
                        formattedExpense = formatter.format(summary.totalExpense),
                        balanceValue = summary.balance,
                        changeValue = changeValue,
                        changePercent = changePercent
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Erro ao carregar resumo"
                    )
                }
            )
        }

        viewModelScope.launch {
            summaryRepository.getMonthlySummary(6).fold(
                onSuccess = { monthlyHistory ->
                    _uiState.value = _uiState.value.copy(monthlyHistory = monthlyHistory)
                },
                onFailure = { /* Silently fail for monthly history */ }
            )
        }
    }

    fun refresh() {
        loadSummary()
    }
}