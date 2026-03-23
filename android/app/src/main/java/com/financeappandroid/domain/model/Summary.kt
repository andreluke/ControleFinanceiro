package com.financeappandroid.domain.model

data class Summary(
    val totalIncome: Double,
    val totalExpense: Double,
    val balance: Double,
    val month: String?,
    val byCategory: List<CategorySummary>,
    val recentTransactions: List<Transaction>
)

data class CategorySummary(
    val categoryId: String,
    val categoryName: String,
    val categoryColor: String?,
    val categoryIcon: String?,
    val total: Double,
    val percentage: Double
)

data class MonthlySummary(
    val month: String?,
    val totalIncome: Double,
    val totalExpense: Double,
    val balance: Double
)

data class Forecast(
    val projectedIncome: Double,
    val projectedExpense: Double,
    val projectedBalance: Double,
    val daysRemaining: Int,
    val dailyAverageIncome: Double,
    val dailyAverageExpense: Double
)