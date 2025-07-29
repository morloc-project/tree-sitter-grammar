package tree_sitter_morloc_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_morloc "github.com/morloc-project/morloc/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_morloc.Language())
	if language == nil {
		t.Errorf("Error loading Morloc grammar")
	}
}
