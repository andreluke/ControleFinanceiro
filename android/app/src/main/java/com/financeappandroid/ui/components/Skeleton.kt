package com.financeappandroid.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.financeappandroid.ui.theme.Card

@Composable
fun SkeletonBox(
    modifier: Modifier = Modifier,
    shape: RoundedCornerShape = RoundedCornerShape(12.dp)
) {
    val infiniteTransition = rememberInfiniteTransition(label = "skeleton")
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.5f,
        targetValue = 0.8f,
        animationSpec = infiniteRepeatable(
            animation = tween(500, easing = EaseInOut),
            repeatMode = RepeatMode.Reverse
        ),
        label = "skeleton"
    )

    Box(
        modifier = modifier
            .clip(shape)
            .background(Color.LightGray.copy(alpha = alpha))
    )
}

@Composable
fun SkeletonCard(
    modifier: Modifier = Modifier,
    height: Int = 120
) {
    AppCard(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SkeletonBox(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(20.dp),
                shape = RoundedCornerShape(4.dp)
            )
            SkeletonBox(
                modifier = Modifier
                    .fillMaxWidth(0.7f)
                    .height(16.dp),
                shape = RoundedCornerShape(4.dp)
            )
        }
    }
}

@Composable
fun SkeletonKPI(
    modifier: Modifier = Modifier
) {
    AppCard(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            SkeletonBox(
                modifier = Modifier.size(40.dp),
                shape = RoundedCornerShape(8.dp)
            )
            SkeletonBox(
                modifier = Modifier
                    .fillMaxWidth(0.6f)
                    .height(14.dp),
                shape = RoundedCornerShape(4.dp)
            )
            SkeletonBox(
                modifier = Modifier
                    .fillMaxWidth(0.8f)
                    .height(20.dp),
                shape = RoundedCornerShape(4.dp)
            )
        }
    }
}

@Composable
fun SkeletonTransactionItem(
    modifier: Modifier = Modifier
) {
    AppCard(modifier = modifier) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            SkeletonBox(
                modifier = Modifier.size(40.dp),
                shape = RoundedCornerShape(20.dp)
            )
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SkeletonBox(
                    modifier = Modifier
                        .fillMaxWidth(0.8f)
                        .height(16.dp),
                    shape = RoundedCornerShape(4.dp)
                )
                SkeletonBox(
                    modifier = Modifier
                        .fillMaxWidth(0.5f)
                        .height(12.dp),
                    shape = RoundedCornerShape(4.dp)
                )
            }
            SkeletonBox(
                modifier = Modifier
                    .width(60.dp)
                    .height(16.dp),
                shape = RoundedCornerShape(4.dp)
            )
        }
    }
}
