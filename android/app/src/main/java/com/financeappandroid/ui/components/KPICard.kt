package com.financeappandroid.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.financeappandroid.ui.theme.*

@Composable
fun KPICard(
    label: String,
    value: String,
    icon: ImageVector,
    modifier: Modifier = Modifier,
    iconBackgroundColor: Color = Primary.copy(alpha = 0.2f),
    iconTintColor: Color = Primary,
    valueColor: Color = Foreground,
    minWidth: Int = 180
) {
    AppCard(
        modifier = modifier.widthIn(min = minWidth.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(iconBackgroundColor),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTintColor,
                    modifier = Modifier.size(20.dp)
                )
            }

            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                color = Secondary,
                fontWeight = FontWeight.Medium
            )

            Text(
                text = value,
                style = MaterialTheme.typography.titleLarge,
                color = valueColor,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
