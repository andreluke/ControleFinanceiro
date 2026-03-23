package com.financeappandroid.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.financeappandroid.domain.model.Transaction
import com.financeappandroid.domain.model.TransactionType
import com.financeappandroid.ui.components.AppCard
import com.financeappandroid.ui.components.SkeletonTransactionItem
import com.financeappandroid.ui.theme.*
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionsScreen(
    viewModel: TransactionsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val listState = rememberLazyListState()
    val formatter = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))

    val shouldLoadMore by remember {
        derivedStateOf {
            val lastVisibleItem = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            lastVisibleItem >= uiState.transactions.size - 3 && uiState.hasMore && !uiState.isLoading
        }
    }

    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore) {
            viewModel.loadMore()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Transações",
                style = MaterialTheme.typography.headlineLarge,
                color = Foreground,
                fontWeight = FontWeight.Bold
            )
        }

        // Search Bar
        OutlinedTextField(
            value = uiState.searchQuery,
            onValueChange = { viewModel.search(it) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            placeholder = { Text("Buscar transação...", color = Secondary) },
            leadingIcon = {
                Icon(Icons.Filled.Search, contentDescription = null, tint = Secondary)
            },
            trailingIcon = {
                IconButton(onClick = { }) {
                    Icon(
                        Icons.Filled.FilterList,
                        contentDescription = null,
                        tint = if (uiState.selectedFilter != null) Primary else Secondary
                    )
                }
            },
            singleLine = true,
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Border,
                unfocusedBorderColor = Border,
                focusedTextColor = Foreground,
                unfocusedTextColor = Foreground,
                cursorColor = Primary
            ),
            shape = RoundedCornerShape(12.dp),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Text)
        )

        // Filter Chips
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                FilterChip(
                    selected = uiState.selectedFilter == null,
                    onClick = { viewModel.setFilter(null) },
                    label = { Text("Todos") },
                    selectedColors = FilterChipDefaults.selectedFilterChipColors(
                        containerColor = Primary,
                        labelColor = Foreground,
                        leadingIconColor = Foreground
                    ),
                    leadingIcon = {
                        Icon(Icons.Filled.AllInclusive, contentDescription = null)
                    }
                )
            }
            item {
                FilterChip(
                    selected = uiState.selectedFilter == TransactionType.INCOME,
                    onClick = { viewModel.setFilter(TransactionType.INCOME) },
                    label = { Text("Receitas") },
                    selectedColors = FilterChipDefaults.selectedFilterChipColors(
                        containerColor = Success,
                        labelColor = Foreground,
                        leadingIconColor = Foreground
                    ),
                    leadingIcon = {
                        Icon(Icons.Filled.ArrowDropUp, contentDescription = null)
                    }
                )
            }
            item {
                FilterChip(
                    selected = uiState.selectedFilter == TransactionType.EXPENSE,
                    onClick = { viewModel.setFilter(TransactionType.EXPENSE) },
                    label = { Text("Despesas") },
                    selectedColors = FilterChipDefaults.selectedFilterChipColors(
                        containerColor = Danger,
                        labelColor = Foreground,
                        leadingIconColor = Foreground
                    ),
                    leadingIcon = {
                        Icon(Icons.Filled.ArrowDropDown, contentDescription = null)
                    }
                )
            }
        }

        // Content
        if (uiState.isLoading && uiState.transactions.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Primary)
            }
        } else if (uiState.transactions.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                AppCard(modifier = Modifier.padding(horizontal = 16.dp)) {
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
                            "Nenhuma transação encontrada",
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
            LazyColumn(
                state = listState,
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(uiState.transactions, key = { it.id }) { transaction ->
                    TransactionListItem(transaction = transaction, formatter = formatter)
                }

                if (uiState.isLoading) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(
                                color = Primary,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(80.dp))
                }
            }
        }
    }
}

@Composable
private fun TransactionListItem(
    transaction: Transaction,
    formatter: NumberFormat
) {
    val dateFormatter = SimpleDateFormat("dd/MM/yyyy", Locale("pt", "BR"))

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
                    modifier = Modifier.size(22.dp)
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
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        transaction.category?.name ?: "Sem categoria",
                        style = MaterialTheme.typography.labelSmall,
                        color = Secondary
                    )
                    if (transaction.paymentMethod != null) {
                        Text(
                            " · ${transaction.paymentMethod.name}",
                            style = MaterialTheme.typography.labelSmall,
                            color = Secondary
                        )
                    }
                }
                Text(
                    dateFormatter.format(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(transaction.date) ?: Date()),
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
                    dateFormatter.format(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(transaction.date) ?: Date()),
                    style = MaterialTheme.typography.labelSmall,
                    color = Secondary
                )
            }
        }
    }
}
