package com.financeappandroid.domain.repository

import com.financeappandroid.domain.model.*

interface TransactionRepository {
    suspend fun getTransactions(
        type: TransactionType? = null,
        categoryId: String? = null,
        page: Int? = null,
        limit: Int? = null
    ): Result<TransactionList>

    suspend fun getTransaction(id: String): Result<Transaction>
    suspend fun createTransaction(
        description: String,
        amount: Double,
        type: TransactionType,
        date: String,
        categoryId: String?,
        subcategoryId: String?,
        paymentMethodId: String?
    ): Result<Transaction>
    suspend fun updateTransaction(
        id: String,
        description: String,
        amount: Double,
        type: TransactionType,
        date: String,
        categoryId: String?,
        subcategoryId: String?,
        paymentMethodId: String?
    ): Result<Transaction>
    suspend fun deleteTransaction(id: String): Result<Unit>
}