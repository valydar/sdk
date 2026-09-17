plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

val okhttpVersion = "4.12.0"
val kotlinxSerializationVersion = "1.11.0"
val androidxCameraVersion = "1.3.0"

android {
    namespace = "com.valydar"
    compileSdk = 34

    defaultConfig {
        minSdk = 26
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("com.squareup.okhttp3:okhttp:$okhttpVersion")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:$kotlinxSerializationVersion")
    implementation("androidx.camera:camera-core:$androidxCameraVersion")
    implementation("androidx.camera:camera-camera2:$androidxCameraVersion")
}
