package com.financeappandroid.data.repository

import com.financeappandroid.data.remote.TransactionService
import com.financeappandroid.data.remote.dto.CreateTransactionRequest
import com.financeappandroid.data.remote.dto.TransactionDto
import com.financeappandroid.domain.model.*
import com.financeappandroid.domain.repository.TransactionRepository
import javax.inject.Inject

class TransactionRepositoryImpl @Inject constructor(
    private val transactionService: TransactionService
) : TransactionRepository {

    override suspend fun getTransactions(
        type: TransactionType?,
        categoryId: String?,
        page: Int?,
        limit: Int?
    ): Result<TransactionList> {
        return try {
            val response = transactionService.getTransactions(
                type = type?.name?.lowercase(),
                categoryId = categoryId,
                page = page,
                limit = limit
            )
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                Result.success(
                    TransactionList(
                        transactions = body.transactions.map { it.toDomain() },
                        total = body.total,
                        page = body.page,
                        limit = body.limit
                    )
                )
            } else {
                Result.failure(Exception("Failed to get transactions: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getTransaction(id: String): Result<Transaction> {
        return try {
            val response = transactionService.getTransaction(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.toDomain())
            } else {
                Result.failure(Exception("Failed to get transaction: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun createTransaction(
        description: String,
        amount: Double,
        type: TransactionType,
        date: String,
        categoryId: String?,
        subcategoryId: String?,
        paymentMethodId: String?
    ): Result<Transaction> {
        return try {
            val request = CreateTransactionRequest(
                description = description,
                amount = amount,
                type = type.name.lowercase(),
                date = date,
                categoryId = categoryId,
                subcategoryId = subcategoryId,
                paymentMethodId = paymentMethodId
            )
            val response = transactionService.createTransaction(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.toDomain())
            } else {
                Result.failure(Exception("Failed to create transaction: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateTransaction(
        id: String,
        description: String,
        amount: Double,
        type: TransactionType,
        date: String,
        categoryId: String?,
        subcategoryId: String?,
        paymentMethodId: String?
    ): Result<Transaction> {
        return try {
            val request = CreateTransactionRequest(
                description = description,
                amount = amount,
                type = type.name.lowercase(),
                date = date,
                categoryId = categoryId,
                subcategoryId = subcategoryId,
                paymentMethodId = paymentMethodId
            )
            val response = transactionService.updateTransaction(id, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.toDomain())
            } else {
                Result.failure(Exception("Failed to update transaction: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun deleteTransaction(id: String): Result<Unit> {
        return try {
            val response = transactionService.deleteTransaction(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to delete transaction: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun TransactionDto.toDomain(): Transaction {
        return Transaction(
            id = id,
            description = description,
            amount = amount,
            type = TransactionType.fromString(type),
            date = date,
            categoryId = categoryId,
            subcategoryId = subcategoryId,
            paymentMethodId = paymentMethodId,
            createdAt = createdAt,
            category = category?.let {
                Category(
                    id = it.id,
                    name = it.name,
                    color = it.color,
                    icon = it.icon,
                    type = TransactionType.fromString(it.type),
                    createdAt = it.createdAt
                )
            },
            subcategory = subcategory?.let {
                Subcategory(
                    id = it.id,
                    name = it.name,
                    categoryId = it.categoryId,
                    createdAt = it.createdAt
                )
            },
            paymentMethod = paymentMethod?.let {
                PaymentMethod(
                    id = it.id,
                    name = it.name,
                    type = it.type,
                    createdAt = it.createdAt
                )
            }
        )
    }
}