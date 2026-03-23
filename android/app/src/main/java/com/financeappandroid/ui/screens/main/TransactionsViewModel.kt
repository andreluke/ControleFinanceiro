package com.financeappandroid.ui.screens.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.financeappandroid.domain.model.Transaction
import com.financeappandroid.domain.model.TransactionType
import com.financeappandroid.domain.model.TransactionList
import com.financeappandroid.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TransactionsUiState(
    val isLoading: Boolean = false,
    val transactions: List<Transaction> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val hasMore: Boolean = false,
    val selectedFilter: TransactionType? = null,
    val searchQuery: String = "",
    val error: String? = null
)

@HiltViewModel
class TransactionsViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TransactionsUiState())
    val uiState: StateFlow<TransactionsUiState> = _uiState.asStateFlow()

    init {
        loadTransactions()
    }

    fun loadTransactions(loadMore: Boolean = false) {
        if (_uiState.value.isLoading) return
        
        val nextPage = if (loadMore) _uiState.value.page + 1 else 1
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null,
                page = nextPage
            )
            
            transactionRepository.getTransactions(
                type = _uiState.value.selectedFilter,
                page = nextPage,
                limit = 20
            ).fold(
                onSuccess = { result: TransactionList ->
                    val newTransactions = if (loadMore) {
                        _uiState.value.transactions + result.transactions
                    } else {
                        result.transactions
                    }
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        transactions = newTransactions,
                        total = result.total,
                        hasMore = result.transactions.size >= 20
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Erro ao carregar transacoes"
                    )
                }
            )
        }
    }

    fun setFilter(type: TransactionType?) {
        _uiState.value = _uiState.value.copy(selectedFilter = type, page = 1)
        loadTransactions()
    }

    fun search(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        // TODO: Implement search filtering
    }

    fun loadMore() {
        if (_uiState.value.hasMore) {
            loadTransactions(loadMore = true)
        }
    }

    fun refresh() {
        loadTransactions()
    }
}