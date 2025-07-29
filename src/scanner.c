// scanner.c
#include <tree_sitter/parser.h>
#include <wctype.h>
#include <string.h>

#define MAX_INDENT 127

enum TokenType {
  INDENT,
  DEDENT,
  NEWLINE,
  LEFT_ALIGNED
};

typedef struct {
  uint32_t indents[MAX_INDENT];
  uint32_t level;
} IndentStack;

bool tree_sitter_morloc_external_scanner_scan(
    void *payload, TSLexer *lexer,
    const bool *valid_symbols)
{
  static IndentStack stack = { 0 };

  if (lexer->get_column(lexer) != 0) {
      while (lexer->lookahead == ' ') {
        lexer->advance(lexer, true);
      }
      if(lexer->lookahead != '\n'){
        return false;
      }
  }

  // Count indentation (spaces only)
  uint32_t indent = 0;
  bool done = false;
  while (!done) {
    switch(lexer->lookahead){
        // skip newlines
        case '\n':
        case '\r':
            indent = 0;
            lexer->advance(lexer, true);
            break;
        case ' ':
        case '\t':
            indent++;
            lexer->advance(lexer, true);
            break;
        default:
            done = true;
    }
  }

  if (lexer->eof(lexer)) {
    // Empty line: skip
    return false;
  }

  uint32_t prev = stack.indents[stack.level];
  if (indent > prev && valid_symbols[INDENT]) {
    // increase indent
    stack.level++;
    stack.indents[stack.level] = indent;
    lexer->result_symbol = INDENT;
  }
  else if (indent < prev && valid_symbols[DEDENT]) {
    // zero out current stack level
    stack.indents[stack.level] = 0;
    stack.level--;
    stack.indents[stack.level] = indent;
    lexer->result_symbol = DEDENT;
  }
  else if (indent == prev && valid_symbols[LEFT_ALIGNED]) {
    lexer->result_symbol = LEFT_ALIGNED;
  }
  // Optionally: emit NEWLINE if desired
  else if (valid_symbols[NEWLINE]) {
    lexer->result_symbol = NEWLINE;
  } else {
      // No scanner token matched
      return false;
  }
  return true;
}

void *tree_sitter_morloc_external_scanner_create() { return NULL; }

void tree_sitter_morloc_external_scanner_destroy(void *payload) {}

void tree_sitter_morloc_external_scanner_reset(void *payload) {}

unsigned tree_sitter_morloc_external_scanner_serialize(void *payload, char *buffer) { return 0; }

void tree_sitter_morloc_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}
