package com.financeappandroid.di

import android.content.Context
import com.financeappandroid.BuildConfig
import com.financeappandroid.data.preferences.TokenPreferences
import com.financeappandroid.data.remote.AuthInterceptor
import com.financeappandroid.data.remote.AuthService
import com.financeappandroid.data.remote.CategoryService
import com.financeappandroid.data.remote.SummaryService
import com.financeappandroid.data.remote.TransactionService
import com.financeappandroid.data.repository.AuthRepositoryImpl
import com.financeappandroid.data.repository.CategoryRepositoryImpl
import com.financeappandroid.data.repository.SummaryRepositoryImpl
import com.financeappandroid.data.repository.TransactionRepositoryImpl
import com.financeappandroid.domain.repository.AuthRepository
import com.financeappandroid.domain.repository.CategoryRepository
import com.financeappandroid.domain.repository.SummaryRepository
import com.financeappandroid.domain.repository.TransactionRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Provider
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideTokenPreferences(@ApplicationContext context: Context): TokenPreferences {
        return TokenPreferences(context)
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        tokenPreferences: TokenPreferences,
        authServiceProvider: Provider<AuthService>
    ): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor(AuthInterceptor(tokenPreferences, authServiceProvider))
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthService(retrofit: Retrofit): AuthService {
        return retrofit.create(AuthService::class.java)
    }

    @Provides
    @Singleton
    fun provideSummaryService(retrofit: Retrofit): SummaryService {
        return retrofit.create(SummaryService::class.java)
    }

    @Provides
    @Singleton
    fun provideTransactionService(retrofit: Retrofit): TransactionService {
        return retrofit.create(TransactionService::class.java)
    }

    @Provides
    @Singleton
    fun provideCategoryService(retrofit: Retrofit): CategoryService {
        return retrofit.create(CategoryService::class.java)
    }
}

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideAuthRepository(
        authService: AuthService,
        tokenPreferences: TokenPreferences
    ): AuthRepository {
        return AuthRepositoryImpl(authService, tokenPreferences)
    }

    @Provides
    @Singleton
    fun provideSummaryRepository(
        summaryService: SummaryService
    ): SummaryRepository {
        return SummaryRepositoryImpl(summaryService)
    }

    @Provides
    @Singleton
    fun provideTransactionRepository(
        transactionService: TransactionService
    ): TransactionRepository {
        return TransactionRepositoryImpl(transactionService)
    }

    @Provides
    @Singleton
    fun provideCategoryRepository(
        categoryService: CategoryService
    ): CategoryRepository {
        return CategoryRepositoryImpl(categoryService)
    }
}