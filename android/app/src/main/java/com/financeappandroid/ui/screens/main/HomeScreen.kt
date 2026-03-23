package com.financeappandroid.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.financeappandroid.domain.model.Transaction
import com.financeappandroid.domain.model.TransactionType
import com.financeappandroid.ui.components.*
import com.financeappandroid.ui.theme.*
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToTransactions: () -> Unit = {},
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val formatter = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Background),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 16.dp)
            ) {
                Text(
                    "Olá, Usuário",
                    style = MaterialTheme.typography.headlineLarge,
                    color = Foreground,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    "Resumo Financeiro",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Secondary
                )
            }
        }

        // KPI Cards - Horizontal scroll
        item {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    KPICard(
                        label = "Saldo Total",
                        value = uiState.formattedBalance,
                        icon = Icons.Filled.AccountBalanceWallet,
                        iconBackgroundColor = Primary.copy(alpha = 0.2f),
                        iconTintColor = Primary,
                        valueColor = if (uiState.balanceValue >= 0) Success else Danger
                    )
                }
                item {
                    KPICard(
                        label = "Receitas",
                        value = uiState.formattedIncome,
                        icon = Icons.Filled.ArrowDropUp,
                        iconBackgroundColor = Success.copy(alpha = 0.2f),
                        iconTintColor = Success,
                        valueColor = Success
                    )
                }
                item {
                    KPICard(
                        label = "Despesas",
                        value = uiState.formattedExpense,
                        icon = Icons.Filled.ArrowDropDown,
                        iconBackgroundColor = Danger.copy(alpha = 0.2f),
                        iconTintColor = Danger,
                        valueColor = Danger
                    )
                }
                item {
                    KPICard(
                        label = "Variação",
                        value = "${uiState.changePercent}%",
                        icon = Icons.Filled.TrendingUp,
                        iconBackgroundColor = Warning.copy(alpha = 0.2f),
                        iconTintColor = Warning,
                        valueColor = if (uiState.changeValue >= 0) Success else Danger
                    )
                }
            }
        }

        // Recent Transactions Section
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Transações Recentes",
                    style = MaterialTheme.typography.titleLarge,
                    color = Foreground,
                    fontWeight = FontWeight.SemiBold
                )
                TextButton(onClick = onNavigateToTransactions) {
                    Text("Ver todas", color = Primary)
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = null,
                        tint = Primary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }

        // Loading state
        if (uiState.isLoading) {
            item {
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    repeat(3) {
                        SkeletonTransactionItem()
                    }
                }
            }
        } else if (uiState.recentTransactions.isEmpty()) {
            // Empty state
            item {
                AppCard(
                    modifier = Modifier.padding(horizontal = 16.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .background(Muted.copy(alpha = 0.3f), RoundedCornerShape(32.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.Receipt,
                                contentDescription = null,
                                tint = Secondary,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            "Nenhuma transação recente",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Foreground,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Suas transações aparecerão aqui",
                            style = MaterialTheme.typography.bodySmall,
                            color = Secondary
                        )
                    }
                }
            }
        } else {
            // Transactions list
            items(uiState.recentTransactions) { transaction ->
                TransactionItem(transaction = transaction)
            }
        }

        // Bottom padding for FAB navigation
        item {
            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
private fun TransactionItem(transaction: Transaction) {
    val formatter = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))
    val dateFormatter = SimpleDateFormat("dd/MM", Locale("pt", "BR"))

    val isIncome = transaction.type == TransactionType.INCOME
    val iconColor = if (isIncome) Success else Danger
    val iconBackgroundColor = if (isIncome) Success.copy(alpha = 0.2f) else Danger.copy(alpha = 0.2f)

    AppCard {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(iconBackgroundColor, RoundedCornerShape(22.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isIncome) Icons.Filled.ArrowDropUp else Icons.Filled.ArrowDropDown,
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(24.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    transaction.description.ifEmpty { "Sem descrição" },
                    style = MaterialTheme.typography.bodyMedium,
                    color = Foreground,
                    fontWeight = FontWeight.Medium,
                    maxLines = 1
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    transaction.category?.name ?: "Sem categoria",
                    style = MaterialTheme.typography.labelSmall,
                    color = Secondary
                )
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "${if (isIncome) "+" else "-"} ${formatter.format(transaction.amount)}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = iconColor,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    formatDate(transaction.date),
                    style = MaterialTheme.typography.labelSmall,
                    color = Secondary
                )
            }
        }
    }
}

private fun formatDate(dateStr: String): String {
    return try {
        val inputFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val outputFormat = SimpleDateFormat("dd/MM", Locale.getDefault())
        val date = inputFormat.parse(dateStr)
        outputFormat.format(date ?: Date())
    } catch (e: Exception) {
        dateStr
    }
}