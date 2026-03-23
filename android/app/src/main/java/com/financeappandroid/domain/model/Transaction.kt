package com.financeappandroid.domain.model

data class Transaction(
    val id: String,
    val description: String,
    val amount: Double,
    val type: TransactionType,
    val date: String,
    val categoryId: String?,
    val subcategoryId: String?,
    val paymentMethodId: String?,
    val createdAt: String?,
    val category: Category?,
    val subcategory: Subcategory?,
    val paymentMethod: PaymentMethod?
)

enum class TransactionType {
    INCOME, EXPENSE;

    companion object {
        fun fromString(value: String): TransactionType {
            return when (value.lowercase()) {
                "income" -> INCOME
                "expense" -> EXPENSE
                else -> EXPENSE
            }
        }
    }
}

data class Category(
    val id: String,
    val name: String,
    val color: String?,
    val icon: String?,
    val type: TransactionType,
    val createdAt: String?
)

data class Subcategory(
    val id: String,
    val name: String,
    val categoryId: String,
    val createdAt: String?
)

data class PaymentMethod(
    val id: String,
    val name: String,
    val type: String?,
    val createdAt: String?
)

data class TransactionList(
    val transactions: List<Transaction>,
    val total: Int,
    val page: Int,
    val limit: Int
)