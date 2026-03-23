package com.financeappandroid.ui.screens.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.financeappandroid.domain.model.Category
import com.financeappandroid.domain.model.Transaction
import com.financeappandroid.domain.model.TransactionType
import com.financeappandroid.domain.repository.CategoryRepository
import com.financeappandroid.domain.repository.TransactionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AddTransactionUiState(
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val categories: List<Category> = emptyList(),
    val selectedType: TransactionType = TransactionType.EXPENSE,
    val description: String = "",
    val amount: String = "",
    val date: String = "",
    val selectedCategoryId: String? = null,
    val error: String? = null,
    val isSuccess: Boolean = false
)

@HiltViewModel
class AddTransactionViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val categoryRepository: CategoryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(AddTransactionUiState())
    val uiState: StateFlow<AddTransactionUiState> = _uiState.asStateFlow()

    init {
        loadCategories()
        setCurrentDate()
    }

    private fun loadCategories() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            categoryRepository.getCategories(_uiState.value.selectedType).fold(
                onSuccess = { categories ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        categories = categories
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message
                    )
                }
            )
        }
    }

    private fun setCurrentDate() {
        val today = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            .format(java.util.Date())
        _uiState.value = _uiState.value.copy(date = today)
    }

    fun setType(type: TransactionType) {
        _uiState.value = _uiState.value.copy(selectedType = type, selectedCategoryId = null)
        loadCategories()
    }

    fun updateDescription(description: String) {
        _uiState.value = _uiState.value.copy(description = description, error = null)
    }

    fun updateAmount(amount: String) {
        _uiState.value = _uiState.value.copy(amount = amount, error = null)
    }

    fun updateDate(date: String) {
        _uiState.value = _uiState.value.copy(date = date, error = null)
    }

    fun selectCategory(categoryId: String?) {
        _uiState.value = _uiState.value.copy(selectedCategoryId = categoryId)
    }

    fun saveTransaction() {
        val state = _uiState.value

        if (state.description.isBlank()) {
            _uiState.value = state.copy(error = "Descricao obrigatoria")
            return
        }

        val amountValue = state.amount.toDoubleOrNull()
        if (amountValue == null || amountValue <= 0) {
            _uiState.value = state.copy(error = "Valor invalido")
            return
        }

        if (state.date.isBlank()) {
            _uiState.value = state.copy(error = "Data obrigatoria")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, error = null)

            transactionRepository.createTransaction(
                description = state.description,
                amount = amountValue,
                type = state.selectedType,
                date = state.date,
                categoryId = state.selectedCategoryId,
                subcategoryId = null,
                paymentMethodId = null
            ).fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isSaving = false,
                        isSuccess = true
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isSaving = false,
                        error = error.message ?: "Erro ao salvar transacao"
                    )
                }
            )
        }
    }
}