package com.financeappandroid.domain.repository

import com.financeappandroid.domain.model.Category
import com.financeappandroid.domain.model.TransactionType

interface CategoryRepository {
    suspend fun getCategories(type: TransactionType? = null, includeDeleted: Boolean? = null): Result<List<Category>>
    suspend fun createCategory(name: String, color: String?, icon: String?, type: TransactionType): Result<Category>
    suspend fun updateCategory(id: String, name: String, color: String?, icon: String?, type: TransactionType): Result<Category>
    suspend fun deleteCategory(id: String): Result<Unit>
    suspend fun restoreCategory(id: String): Result<Category>
}