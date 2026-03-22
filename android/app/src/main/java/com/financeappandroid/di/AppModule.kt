package com.financeappandroid.di

import android.content.Context
import com.financeappandroid.BuildConfig
import com.financeappandroid.data.preferences.TokenPreferences
import com.financeappandroid.data.remote.AuthInterceptor
import com.financeappandroid.data.remote.AuthService
import com.financeappandroid.data.repository.AuthRepositoryImpl
import com.financeappandroid.domain.repository.AuthRepository
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
        authService: AuthService
    ): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .addInterceptor(logging)
            .addInterceptor(AuthInterceptor(tokenPreferences, authService))
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
}