// scanner.c
#include <tree_sitter/parser.h>
#include <wctype.h>
#include <string.h>

#define MAX_INDENT 127

enum TokenType {
  INDENT,
  DEDENT,
  LEFT_ALIGNED,
  NEWLINE
};

typedef struct {
  // each value contains the total indentation
  uint32_t indents[MAX_INDENT];
  // current number of indents (indexes into the `indents` array) 
  uint32_t level;
  // total number of unused DEDENTs
  uint32_t dedents;
  // are we currently in whitespace?
  // this stupid variable keeps creeping back every time I delete it
  bool in_whitespace;
} Scanner;


bool tree_sitter_morloc_external_scanner_scan(
    void *payload, TSLexer *lexer,
    const bool *valid_symbols)
{
    Scanner *scanner = (Scanner *)payload;

    // eat whitespace
    while(lexer->lookahead == ' '){
        lexer->advance(lexer, true);
    }

    switch (lexer->lookahead) {
        case '\r':
        case '\n':
            scanner->in_whitespace = true;
            lexer->advance(lexer, true);
            scanner->dedents = 0;
            break;
    }

    // either we just passed a newline OR we are at the start of the file
    if(scanner->in_whitespace){
        // eat the space
        while(lexer->lookahead == ' '){
            lexer->advance(lexer, true);
        }
        // if relevant, find our current dedent level
        if( scanner->dedents == 0 &&
            lexer->get_column(lexer) < scanner->indents[scanner->level]
        ){
            for(int i = scanner->level; i >= 0; i--){
                if(lexer->get_column(lexer) == scanner->indents[i]){
                    scanner->dedents = scanner->level - i;
                }
            }
        }
    }

    // loop through all the required dedents, once per scanner call
    if( valid_symbols[DEDENT] &&
        scanner->level > 0 &&
        scanner->dedents > 0
    ){
        scanner->indents[scanner->level] = 0;
        scanner->level--;
        scanner->dedents--;
        lexer->result_symbol = DEDENT;
        return true;
    }

    // check if we are left aligned to the current indent level
    if(valid_symbols[LEFT_ALIGNED] &&
       scanner->in_whitespace &&
       lexer->get_column(lexer) == scanner->indents[scanner->level]
    ){
        lexer->result_symbol = LEFT_ALIGNED;
        scanner->in_whitespace = false;
        return true;
    }

    // set a new indent level (e.g., after a "where" term)
    if( valid_symbols[INDENT] &&
        scanner->in_whitespace &&
        lexer->get_column(lexer) > scanner->indents[scanner->level]
    ){
        scanner->level++;
        scanner->indents[scanner->level] = lexer->get_column(lexer);
        lexer->result_symbol = INDENT;
        return true;
    }

    scanner->in_whitespace = false;
    return false;
}
          
void *tree_sitter_morloc_external_scanner_create() {
  Scanner *scanner = malloc(sizeof(Scanner));
  memset(scanner, 0, sizeof(Scanner));
  // initialize scanner fields
  return scanner;
}

void tree_sitter_morloc_external_scanner_destroy(void *payload) {
  free(payload);
}

void tree_sitter_morloc_external_scanner_reset(void *payload) {
  Scanner *scanner = (Scanner *)payload;
  memset(scanner->indents, 0, sizeof(scanner->indents));
  scanner->level = 0;
  scanner->dedents = 0;
  scanner->in_whitespace = true;
}

unsigned tree_sitter_morloc_external_scanner_serialize(void *payload, char *buffer) {
  Scanner *scanner = (Scanner *)payload;
  // Copy your scanner state into buffer to save it.
  memcpy(buffer, scanner, sizeof(Scanner));
  return sizeof(Scanner);
}

void tree_sitter_morloc_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
  Scanner *scanner = (Scanner *)payload;
  // Restore your scanner state from buffer.
  if (length == sizeof(Scanner)) {
    memcpy(scanner, buffer, sizeof(Scanner));
  }
}

