import XCTest
import SwiftTreeSitter
import TreeSitterMorloc

final class TreeSitterMorlocTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_morloc())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Morloc grammar")
    }
}
