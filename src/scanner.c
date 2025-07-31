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
  uint32_t indents[MAX_INDENT];
  uint32_t level;
  uint32_t dedent_space;
  bool in_whitespace;
} Scanner;


bool tree_sitter_morloc_external_scanner_scan(
    void *payload, TSLexer *lexer,
    const bool *valid_symbols)
{
    Scanner *scanner = (Scanner *)payload;

    switch (lexer->lookahead) {
        case '\r':
        case '\n':
            scanner->in_whitespace = true;
            lexer->advance(lexer, true);
            scanner->dedent_space = 0;
            break;
    }

    if(valid_symbols[DEDENT] && lexer->get_column(lexer) == 0){
        if(scanner->level == 1){
            if(lexer->get_column(lexer) == scanner->indents[0] && lexer->lookahead != ' '){
                lexer->result_symbol = DEDENT;
                scanner->indents[1] = 0;
                scanner->level--;
                return true;
            }
        }
    }

        /* // No indentation, so dedentation is impossible                */
        /* if(scanner->level == 0){                                          */
        /*     return false;                                              */
        /* }                                                              */
        /* while(lexer->lookahead == ' '){                                */
        /*     lexer->advance(lexer, true);                               */
        /* }                                                              */
        /* in_whitespace = false;                                         */
        /* // This is the first dedent                                    */
        /* if (scanner->dedent_space == 0){                                        */
        /*     if(lexer->get_column(lexer) < scanner->indents[scanner->level]){ */
        /*         scanner->dedent_space = lexer->get_column(lexer);               */
        /*     } else {                                                   */
        /*         return false;                                          */
        /*     }                                                          */
        /* }                                                              */
        /* scanner->level--;                                                 */
        /* if(scanner->dedent_space < scanner->indents[scanner->level]){                 */
        /*     return false;                                              */
        /* }                                                              */
        /* while(scanner->dedent_space > scanner->indents[scanner->level]){              */
        /*     scanner->dedent_space--;                                            */
        /* }                                                              */
        /* lexer->result_symbol = DEDENT;                                 */
        /* return true;                                                   */

    if(valid_symbols[LEFT_ALIGNED]){
        if(scanner->in_whitespace){
            while(lexer->get_column(lexer) < scanner->indents[scanner->level]){
                if(lexer->lookahead == ' '){
                    lexer->advance(lexer, true);
                } else {
                    scanner->in_whitespace = false;
                    return false;
                }
            }
        }

        if(lexer->get_column(lexer) == scanner->indents[scanner->level] &&
           lexer->lookahead != ' '  &&
           lexer->lookahead != '\0' &&
           lexer->lookahead != '\n'
          ){
            scanner->in_whitespace = false;
            lexer->result_symbol = LEFT_ALIGNED;
            return true;
        }
    }

    if(lexer->get_column(lexer) == 0 && valid_symbols[INDENT]){
        while(lexer->lookahead == ' '){
            lexer->advance(lexer, true);
        }
        scanner->in_whitespace = false;
        if(lexer->get_column(lexer) > scanner->indents[scanner->level]){
            scanner->level++;
            scanner->indents[scanner->level] = lexer->get_column(lexer);
            lexer->result_symbol = INDENT;
            return true;
        }
    }

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
  scanner->dedent_space = 0;
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

