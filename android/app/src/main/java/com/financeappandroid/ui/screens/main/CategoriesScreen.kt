package com.financeappandroid.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.financeappandroid.domain.model.Category
import com.financeappandroid.domain.model.TransactionType
import com.financeappandroid.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoriesScreen(
    viewModel: CategoriesViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Categorias",
                    style = MaterialTheme.typography.headlineSmall,
                    color = Foreground,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = { viewModel.showCreateDialog() }) {
                    Icon(
                        imageVector = Icons.Filled.Add,
                        contentDescription = "Adicionar",
                        tint = Primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(
                        selected = uiState.selectedFilter == null,
                        onClick = { viewModel.setFilter(null) },
                        label = { Text("Todas") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Primary,
                            selectedLabelColor = Foreground
                        )
                    )
                }
                item {
                    FilterChip(
                        selected = uiState.selectedFilter == TransactionType.EXPENSE,
                        onClick = { viewModel.setFilter(TransactionType.EXPENSE) },
                        label = { Text("Despesas") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Danger,
                            selectedLabelColor = Foreground
                        )
                    )
                }
                item {
                    FilterChip(
                        selected = uiState.selectedFilter == TransactionType.INCOME,
                        onClick = { viewModel.setFilter(TransactionType.INCOME) },
                        label = { Text("Receitas") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Success,
                            selectedLabelColor = Foreground
                        )
                    )
                }
            }
        }

        if (uiState.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Primary)
            }
        } else if (uiState.categories.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Filled.Folder,
                        contentDescription = null,
                        tint = Secondary,
                        modifier = Modifier.size(64.dp)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "Nenhuma categoria encontrada",
                        style = MaterialTheme.typography.bodyLarge,
                        color = Secondary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    TextButton(onClick = { viewModel.showCreateDialog() }) {
                        Text("Criar categoria", color = Primary)
                    }
                }
            }
        } else {
            LazyColumn(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(uiState.categories, key = { it.id }) { category ->
                    CategoryItem(
                        category = category,
                        onEdit = { viewModel.showEditDialog(category) },
                        onDelete = { viewModel.deleteCategory(category) }
                    )
                }
                item { Spacer(modifier = Modifier.height(80.dp)) }
            }
        }
    }

    if (uiState.showDialog) {
        CategoryDialog(
            isEditing = uiState.editingCategory != null,
            name = uiState.dialogName,
            color = uiState.dialogColor,
            type = uiState.dialogType,
            error = uiState.dialogError,
            isSaving = uiState.isSaving,
            onNameChange = { viewModel.updateDialogName(it) },
            onColorChange = { viewModel.updateDialogColor(it) },
            onTypeChange = { viewModel.updateDialogType(it) },
            onSave = { viewModel.saveCategory() },
            onDismiss = { viewModel.hideDialog() }
        )
    }
}

@Composable
private fun CategoryItem(
    category: Category,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    var showMenu by remember { mutableStateOf(false) }
    val color = try {
        Color(android.graphics.Color.parseColor(category.color ?: "#888888"))
    } catch (e: Exception) {
        Secondary
    }

    Card(
        colors = CardDefaults.cardColors(containerColor = Card),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(color.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(20.dp)
                        .clip(CircleShape)
                        .background(color)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    category.name,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Foreground,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    if (category.type == TransactionType.EXPENSE) "Despesa" else "Receita",
                    style = MaterialTheme.typography.labelSmall,
                    color = Secondary
                )
            }

            Box {
                IconButton(onClick = { showMenu = true }) {
                    Icon(
                        imageVector = Icons.Filled.MoreVert,
                        contentDescription = "Opcoes",
                        tint = Secondary
                    )
                }
                DropdownMenu(
                    expanded = showMenu,
                    onDismissRequest = { showMenu = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("Editar") },
                        onClick = {
                            showMenu = false
                            onEdit()
                        },
                        leadingIcon = {
                            Icon(Icons.Filled.Edit, contentDescription = null)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Excluir", color = Danger) },
                        onClick = {
                            showMenu = false
                            onDelete()
                        },
                        leadingIcon = {
                            Icon(Icons.Filled.Delete, contentDescription = null, tint = Danger)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun CategoryDialog(
    isEditing: Boolean,
    name: String,
    color: String,
    type: TransactionType,
    error: String?,
    isSaving: Boolean,
    onNameChange: (String) -> Unit,
    onColorChange: (String) -> Unit,
    onTypeChange: (TransactionType) -> Unit,
    onSave: () -> Unit,
    onDismiss: () -> Unit
) {
    val colorOptions = listOf(
        "#EF4444", "#F97316", "#F59E0B", "#EAB308",
        "#84CC16", "#22C55E", "#14B8A6", "#06B6D4",
        "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
        "#D946EF", "#EC4899", "#F43F5E"
    )

    AlertDialog(
        onDismissRequest = { if (!isSaving) onDismiss() },
        containerColor = Card,
        title = {
            Text(
                if (isEditing) "Editar Categoria" else "Nova Categoria",
                color = Foreground
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = onNameChange,
                    label = { Text("Nome") },
                    singleLine = true,
                    enabled = !isSaving,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Foreground,
                        unfocusedTextColor = Foreground,
                        focusedBorderColor = Primary,
                        unfocusedBorderColor = Border
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Text("Cor", color = Secondary, style = MaterialTheme.typography.labelMedium)
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(colorOptions) { colorOption ->
                        val isSelected = color == colorOption
                        val parsedColor = Color(android.graphics.Color.parseColor(colorOption))
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(parsedColor)
                                .border(
                                    width = if (isSelected) 3.dp else 0.dp,
                                    color = Foreground,
                                    shape = CircleShape
                                )
                                .clickable { onColorChange(colorOption) }
                        )
                    }
                }

                Text("Tipo", color = Secondary, style = MaterialTheme.typography.labelMedium)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(
                        selected = type == TransactionType.EXPENSE,
                        onClick = { onTypeChange(TransactionType.EXPENSE) },
                        label = { Text("Despesa") },
                        enabled = !isSaving,
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Danger,
                            selectedLabelColor = Foreground
                        )
                    )
                    FilterChip(
                        selected = type == TransactionType.INCOME,
                        onClick = { onTypeChange(TransactionType.INCOME) },
                        label = { Text("Receita") },
                        enabled = !isSaving,
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Success,
                            selectedLabelColor = Foreground
                        )
                    )
                }

                if (error != null) {
                    Text(error, color = Danger, style = MaterialTheme.typography.bodySmall)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onSave,
                enabled = !isSaving,
                colors = ButtonDefaults.buttonColors(containerColor = Primary)
            ) {
                if (isSaving) {
                    CircularProgressIndicator(
                        color = Foreground,
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(if (isEditing) "Salvar" else "Criar")
                }
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isSaving
            ) {
                Text("Cancelar", color = Secondary)
            }
        }
    )
}