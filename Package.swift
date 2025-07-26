// swift-tools-version:5.3

import Foundation
import PackageDescription

var sources = ["src/parser.c"]
if FileManager.default.fileExists(atPath: "src/scanner.c") {
    sources.append("src/scanner.c")
}

let package = Package(
    name: "TreeSitterGrammar",
    products: [
        .library(name: "TreeSitterGrammar", targets: ["TreeSitterGrammar"]),
    ],
    dependencies: [
        .package(name: "SwiftTreeSitter", url: "https://github.com/tree-sitter/swift-tree-sitter", from: "0.9.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterGrammar",
            dependencies: [],
            path: ".",
            sources: sources,
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterGrammarTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterGrammar",
            ],
            path: "bindings/swift/TreeSitterGrammarTests"
        )
    ],
    cLanguageStandard: .c11
)
