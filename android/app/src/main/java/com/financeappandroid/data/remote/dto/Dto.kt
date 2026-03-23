package com.financeappandroid.data.remote.dto

import com.google.gson.annotations.SerializedName

// Transaction DTOs
data class TransactionDto(
    val id: String,
    val description: String,
    val amount: Double,
    val type: String,
    val date: String,
    @SerializedName("category_id") val categoryId: String?,
    @SerializedName("subcategory_id") val subcategoryId: String?,
    @SerializedName("payment_method_id") val paymentMethodId: String?,
    @SerializedName("created_at") val createdAt: String?,
    val category: CategoryDto?,
    val subcategory: SubcategoryDto?,
    @SerializedName("payment_method") val paymentMethod: PaymentMethodDto?
)

data class TransactionListResponse(
    val transactions: List<TransactionDto>,
    val total: Int,
    val page: Int,
    val limit: Int
)

data class CreateTransactionRequest(
    val description: String,
    val amount: Double,
    val type: String,
    val date: String,
    @SerializedName("category_id") val categoryId: String?,
    @SerializedName("subcategory_id") val subcategoryId: String?,
    @SerializedName("payment_method_id") val paymentMethodId: String?
)

// Category DTOs
data class CategoryDto(
    val id: String,
    val name: String,
    val color: String?,
    val icon: String?,
    val type: String,
    @SerializedName("created_at") val createdAt: String?
)

data class CreateCategoryRequest(
    val name: String,
    val color: String?,
    val icon: String?,
    val type: String
)

// Subcategory DTOs
data class SubcategoryDto(
    val id: String,
    val name: String,
    @SerializedName("category_id") val categoryId: String,
    @SerializedName("created_at") val createdAt: String?
)

// Payment Method DTOs
data class PaymentMethodDto(
    val id: String,
    val name: String,
    val type: String?,
    @SerializedName("created_at") val createdAt: String?
)

// Summary DTOs
data class SummaryDto(
    val totalIncome: Double,
    val totalExpense: Double,
    val balance: Double,
    val month: String?,
    @SerializedName("by_category") val byCategory: List<CategorySummaryDto>?,
    @SerializedName("recent_transactions") val recentTransactions: List<TransactionDto>?
)

data class CategorySummaryDto(
    val categoryId: String,
    val categoryName: String,
    val categoryColor: String?,
    val categoryIcon: String?,
    val total: Double,
    val percentage: Double
)

data class MonthlySummaryDto(
    val month: String?,
    val totalIncome: Double,
    val totalExpense: Double,
    val balance: Double
)

data class ForecastDto(
    val projectedIncome: Double,
    val projectedExpense: Double,
    val projectedBalance: Double,
    @SerializedName("days_remaining") val daysRemaining: Int,
    @SerializedName("daily_average_income") val dailyAverageIncome: Double,
    @SerializedName("daily_average_expense") val dailyAverageExpense: Double
)