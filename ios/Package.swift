// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Valydar",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "Valydar", targets: ["Valydar"]),
    ],
    dependencies: [],
    targets: [
        .target(name: "Valydar", dependencies: []),
    ]
)
