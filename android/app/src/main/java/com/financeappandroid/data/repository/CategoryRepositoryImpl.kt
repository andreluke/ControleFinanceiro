package com.financeappandroid.data.repository

import com.financeappandroid.data.remote.CategoryService
import com.financeappandroid.data.remote.dto.CreateCategoryRequest
import com.financeappandroid.data.remote.dto.CategoryDto
import com.financeappandroid.domain.model.Category
import com.financeappandroid.domain.model.TransactionType
import com.financeappandroid.domain.repository.CategoryRepository
import javax.inject.Inject

class CategoryRepositoryImpl @Inject constructor(
    private val categoryService: CategoryService
) : CategoryRepository {

    override suspend fun getCategories(type: TransactionType?, includeDeleted: Boolean?): Result<List<Category>> {
        return try {
            val response = categoryService.getCategories(
                type = type?.name?.lowercase(),
                includeDeleted = includeDeleted
            )
            if (response.isSuccessful) {
                Result.success(response.body()?.map { it.toDomain() } ?: emptyList())
            } else {
                Result.failure(Exception("Failed to get categories: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun createCategory(
        name: String,
        color: String?,
        icon: String?,
        type: TransactionType
    ): Result<Category> {
        return try {
            val request = CreateCategoryRequest(
                name = name,
                color = color,
                icon = icon,
                type = type.name.lowercase()
            )
            val response = categoryService.createCategory(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.toDomain())
            } else {
                Result.failure(Exception("Failed to create category: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateCategory(
        id: String,
        name: String,
        color: String?,
        icon: String?,
        type: TransactionType
    ): Result<Category> {
        return try {
            val request = CreateCategoryRequest(
                name = name,
                color = color,
                icon = icon,
                type = type.name.lowercase()
            )
            val response = categoryService.updateCategory(id, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.toDomain())
            } else {
                Result.failure(Exception("Failed to update category: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun deleteCategory(id: String): Result<Unit> {
        return try {
            val response = categoryService.deleteCategory(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete category: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun restoreCategory(id: String): Result<Category> {
        return try {
            val response = categoryService.restoreCategory(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.toDomain())
            } else {
                Result.failure(Exception("Failed to restore category: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun CategoryDto.toDomain(): Category {
        return Category(
            id = id,
            name = name,
            color = color,
            icon = icon,
            type = TransactionType.fromString(type),
            createdAt = createdAt
        )
    }
}