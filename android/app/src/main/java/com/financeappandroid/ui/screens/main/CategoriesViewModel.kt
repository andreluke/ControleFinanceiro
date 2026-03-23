package com.financeappandroid.ui.screens.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.financeappandroid.domain.model.Category
import com.financeappandroid.domain.model.TransactionType
import com.financeappandroid.domain.repository.CategoryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CategoriesUiState(
    val isLoading: Boolean = false,
    val categories: List<Category> = emptyList(),
    val selectedFilter: TransactionType? = null,
    val showDialog: Boolean = false,
    val editingCategory: Category? = null,
    val dialogName: String = "",
    val dialogColor: String = "#888888",
    val dialogType: TransactionType = TransactionType.EXPENSE,
    val dialogError: String? = null,
    val isSaving: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class CategoriesViewModel @Inject constructor(
    private val categoryRepository: CategoryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(CategoriesUiState())
    val uiState: StateFlow<CategoriesUiState> = _uiState.asStateFlow()

    init {
        loadCategories()
    }

    fun loadCategories() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            categoryRepository.getCategories(
                type = _uiState.value.selectedFilter,
                includeDeleted = false
            ).fold(
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

    fun setFilter(type: TransactionType?) {
        _uiState.value = _uiState.value.copy(selectedFilter = type)
        loadCategories()
    }

    fun showCreateDialog() {
        _uiState.value = _uiState.value.copy(
            showDialog = true,
            editingCategory = null,
            dialogName = "",
            dialogColor = "#888888",
            dialogType = TransactionType.EXPENSE,
            dialogError = null
        )
    }

    fun showEditDialog(category: Category) {
        _uiState.value = _uiState.value.copy(
            showDialog = true,
            editingCategory = category,
            dialogName = category.name,
            dialogColor = category.color ?: "#888888",
            dialogType = category.type,
            dialogError = null
        )
    }

    fun hideDialog() {
        _uiState.value = _uiState.value.copy(
            showDialog = false,
            editingCategory = null,
            dialogError = null
        )
    }

    fun updateDialogName(name: String) {
        _uiState.value = _uiState.value.copy(dialogName = name, dialogError = null)
    }

    fun updateDialogColor(color: String) {
        _uiState.value = _uiState.value.copy(dialogColor = color)
    }

    fun updateDialogType(type: TransactionType) {
        _uiState.value = _uiState.value.copy(dialogType = type)
    }

    fun saveCategory() {
        val state = _uiState.value

        if (state.dialogName.isBlank()) {
            _uiState.value = state.copy(dialogError = "Nome obrigatorio")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, dialogError = null)

            val result = if (state.editingCategory != null) {
                categoryRepository.updateCategory(
                    id = state.editingCategory.id,
                    name = state.dialogName,
                    color = state.dialogColor,
                    icon = null,
                    type = state.dialogType
                )
            } else {
                categoryRepository.createCategory(
                    name = state.dialogName,
                    color = state.dialogColor,
                    icon = null,
                    type = state.dialogType
                )
            }

            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(
                        isSaving = false,
                        showDialog = false,
                        editingCategory = null
                    )
                    loadCategories()
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isSaving = false,
                        dialogError = error.message ?: "Erro ao salvar"
                    )
                }
            )
        }
    }

    fun deleteCategory(category: Category) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            categoryRepository.deleteCategory(category.id).fold(
                onSuccess = { loadCategories() },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message
                    )
                }
            )
        }
    }
}