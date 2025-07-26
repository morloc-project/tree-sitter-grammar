import XCTest
import SwiftTreeSitter
import TreeSitterGrammar

final class TreeSitterGrammarTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_grammar())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Grammar grammar")
    }
}
