package com.financeappandroid.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.financeappandroid.domain.model.Category
import com.financeappandroid.domain.model.TransactionType
import com.financeappandroid.ui.components.*
import com.financeappandroid.ui.theme.*
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddTransactionScreen(
    onNavigateBack: () -> Unit,
    viewModel: AddTransactionViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val formatter = NumberFormat.getCurrencyInstance(Locale("pt", "BR"))

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) {
            onNavigateBack()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
    ) {
        TopAppBar(
            title = { Text("Nova Transação", color = Foreground) },
            navigationIcon = {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Voltar",
                        tint = Foreground
                    )
                }
            },
            colors = TopAppBarDefaults.topAppBarColors(containerColor = Background),
            modifier = Modifier.padding(horizontal = 8.dp)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Type Selector - matching mobile design
            TypeSelector(
                selectedType = uiState.selectedType,
                onTypeSelected = { type -> viewModel.setType(type) }
            )

            // Amount Card - Large display like mobile
            AppCard {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "R$",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Secondary,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    OutlinedTextField(
                        value = uiState.amount,
                        onValueChange = { viewModel.updateAmount(it) },
                        placeholder = { Text("0,00", color = Secondary) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color.Transparent,
                            unfocusedBorderColor = Color.Transparent,
                            focusedTextColor = Foreground,
                            unfocusedTextColor = Foreground
                        ),
                        modifier = Modifier.widthIn(min = 200.dp)
                    )
                }
            }

            // Description
            AppInput(
                value = uiState.description,
                onValueChange = { viewModel.updateDescription(it) },
                label = "Descrição",
                placeholder = "O que você comprou?",
                leadingIcon = Icons.Filled.Description,
                singleLine = false,
                maxLines = 3
            )

            // Category
            Text(
                "Categoria",
                style = MaterialTheme.typography.labelLarge,
                color = Secondary,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            if (uiState.isLoading) {
                CircularProgressIndicator(color = Primary, modifier = Modifier.size(24.dp))
            } else if (uiState.categories.isEmpty()) {
                Text(
                    "Nenhuma categoria disponível",
                    color = Secondary,
                    style = MaterialTheme.typography.bodyMedium
                )
            } else {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        CategoryChip(
                            name = "Sem categoria",
                            color = Secondary,
                            isSelected = uiState.selectedCategoryId == null,
                            onClick = { viewModel.selectCategory(null) }
                        )
                    }
                    items(uiState.categories) { category ->
                        val color = try {
                            Color(android.graphics.Color.parseColor(category.color ?: "#888888"))
                        } catch (e: Exception) {
                            Secondary
                        }
                        CategoryChip(
                            name = category.name ?: "Sem nome",
                            color = color,
                            isSelected = uiState.selectedCategoryId == category.id,
                            onClick = { viewModel.selectCategory(category.id) }
                        )
                    }
                }
            }

            // Date
            AppInput(
                value = uiState.date,
                onValueChange = { viewModel.updateDate(it) },
                label = "Data",
                placeholder = "YYYY-MM-DD",
                leadingIcon = Icons.Filled.CalendarMonth
            )

            // Error message
            if (uiState.error != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = Danger.copy(alpha = 0.2f)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Warning,
                            contentDescription = null,
                            tint = Danger,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(uiState.error!!, color = Danger, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }

            // Save Button
            Spacer(modifier = Modifier.height(8.dp))

            AppButton(
                text = if (uiState.isSaving) "Salvando..." else "Salvar Transação",
                onClick = { viewModel.saveTransaction() },
                isLoading = uiState.isSaving,
                enabled = !uiState.isSaving
            )

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
