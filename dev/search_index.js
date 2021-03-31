var documenterSearchIndex = {"docs":
[{"location":"types/#Types","page":"Types","title":"Types","text":"","category":"section"},{"location":"types/","page":"Types","title":"Types","text":"Convenient types for storing analysis results of a given Julia Expr, or for creating certain Julia objects easily. These types define some common syntax one would manipulate in Julia meta programming.","category":"page"},{"location":"types/","page":"Types","title":"Types","text":"JLFunction\nJLStruct\nJLKwStruct\nJLIfElse\nJLMatch\nJLFor\nJLField\nJLKwField\nNoDefault\nJLExpr","category":"page"},{"location":"types/#Expronicon.JLFunction","page":"Types","title":"Expronicon.JLFunction","text":"JLFunction <: JLExpr\n\nType describes a Julia function declaration expression.\n\nExample\n\nConstruct a function expression\n\njulia> JLFunction(;name=:foo, args=[:(x::T)], body= quote 1+1 end, head=:function, whereparams=[:T])\nfunction foo(x::T) where {T}\n    #= REPL[25]:1 =#    \n    1 + 1    \nend\n\nDecompose a function expression\n\njulia> ex = :(function foo(x::T) where {T}\n           #= REPL[25]:1 =#    \n           1 + 1    \n       end)\n:(function foo(x::T) where T\n      #= REPL[26]:1 =#\n      #= REPL[26]:3 =#\n      1 + 1\n  end)\n\njulia> jl = JLFunction(ex)\nfunction foo(x::T) where {T}\n    #= REPL[26]:1 =#    \n    #= REPL[26]:3 =#    \n    1 + 1    \nend\n\nGenerate Expr from JLFunction\n\njulia> codegen_ast(jl)\n:(function foo(x::T) where T\n      #= REPL[26]:1 =#\n      #= REPL[26]:3 =#\n      1 + 1\n  end)\n\n\n\n\n\n","category":"type"},{"location":"types/#Expronicon.JLStruct","page":"Types","title":"Expronicon.JLStruct","text":"JLStruct <: JLExpr\n\nType describes a Julia struct.\n\nExample\n\nConstruct a Julia struct.\n\njulia> JLStruct(;name=:Foo, typevars=[:T], fields=[JLField(;name=:x, type=Int)])\nstruct Foo{T}\n    x::Int64\nend\n\nDecompose a Julia struct expression\n\njulia> ex = :(struct Foo{T}\n           x::Int64\n       end)\n:(struct Foo{T}\n      #= REPL[31]:2 =#\n      x::Int64\n  end)\n\njulia> jl = JLStruct(ex)\nstruct Foo{T}\n    #= REPL[31]:2 =#\n    x::Int64\nend\n\nGenerate a Julia struct expression\n\njulia> codegen_ast(jl)\n:(struct Foo{T}\n      #= REPL[31]:2 =#\n      x::Int64\n  end)\n\n\n\n\n\n","category":"type"},{"location":"types/#Expronicon.JLKwStruct","page":"Types","title":"Expronicon.JLKwStruct","text":"JLKwStruct <: JLExpr\n\nType describes a Julia struct that allows keyword definition of defaults.\n\n\n\n\n\n","category":"type"},{"location":"types/#Expronicon.JLIfElse","page":"Types","title":"Expronicon.JLIfElse","text":"JLIfElse <: JLExpr\n\nJLIfElse describes a Julia if ... elseif ... else ... end expression. It allows one to easily construct such expression by inserting condition and code block via a map.\n\nExample\n\nConstruct JLIfElse object\n\nOne can construct an ifelse as following\n\njulia> jl = JLIfElse()\nnothing\n\njulia> jl.map[:(foo(x))] = :(x = 1 + 1)\n:(x = 1 + 1)\n\njulia> jl.map[:(goo(x))] = :(y = 1 + 2)\n:(y = 1 + 2)\n\njulia> jl.otherwise = :(error(\"abc\"))\n:(error(\"abc\"))\n\njulia> jl\nif foo(x)\n    x = 1 + 1\nelseif goo(x)\n    y = 1 + 2\nelse\n    error(\"abc\")\nend\n\nGenerate the Julia Expr object\n\nto generate the corresponding Expr object, one can call codegen_ast.\n\njulia> codegen_ast(jl)\n:(if foo(x)\n      x = 1 + 1\n  elseif goo(x)\n      y = 1 + 2\n  else\n      error(\"abc\")\n  end)\n\n\n\n\n\n","category":"type"},{"location":"types/#Expronicon.JLMatch","page":"Types","title":"Expronicon.JLMatch","text":"JLMatch <: JLExpr\n\nJLMatch describes a Julia pattern match expression defined by MLStyle. It allows one to construct such expression by simply assign each code block to the corresponding pattern expression.\n\nExample\n\nOne can construct a MLStyle pattern matching expression easily by assigning the corresponding pattern and its result to the map field.\n\njulia> jl = JLMatch(:x)\n#= line 0 =#\nnothing\n\njulia> jl = JLMatch(:x)\n#= line 0 =#\nnothing\n\njulia> jl.map[1] = true\ntrue\n\njulia> jl.map[2] = :(sin(x))\n:(sin(x))\n\njulia> jl\n#= line 0 =#\n@match x begin\n    1 => true\n    2 => sin(x)\n    _ =>     nothing\nend\n\nto generate the corresponding Julia Expr object, one can call codegen_ast.\n\njulia> codegen_ast(jl)\n:(let\n      true\n      var\"##return#263\" = nothing\n      var\"##265\" = x\n      if var\"##265\" isa Int64\n          #= line 0 =#\n          if var\"##265\" === 1\n              var\"##return#263\" = let\n                      true\n                  end\n              #= unused:1 =# @goto var\"####final#264#266\"\n          end\n          #= line 0 =#\n          if var\"##265\" === 2\n              var\"##return#263\" = let\n                      sin(x)\n                  end\n              #= unused:1 =# @goto var\"####final#264#266\"\n          end\n      end\n      #= line 0 =#\n      begin\n          var\"##return#263\" = let\n                  nothing\n              end\n          #= unused:1 =# @goto var\"####final#264#266\"\n      end\n      (error)(\"matching non-exhaustive, at #= line 0 =#\")\n      #= unused:1 =# @label var\"####final#264#266\"\n      var\"##return#263\"\n  end)\n\n\n\n\n\n","category":"type"},{"location":"types/#Expronicon.JLField","page":"Types","title":"Expronicon.JLField","text":"JLField <: JLExpr\nJLField(name, type, line)\n\nType describes a Julia field in a Julia struct.\n\n\n\n\n\n","category":"type"},{"location":"types/#Expronicon.JLKwField","page":"Types","title":"Expronicon.JLKwField","text":"JLKwField <: JLExpr\nJLKwField(name, type, line, default=no_default)\n\nType describes a Julia field that can have a default value in a Julia struct.\n\n\n\n\n\n","category":"type"},{"location":"types/#Expronicon.NoDefault","page":"Types","title":"Expronicon.NoDefault","text":"NoDefault\n\nType describes a field should have no default value.\n\n\n\n\n\n","category":"type"},{"location":"tutorials/#Tutorial","page":"Tutorial","title":"Tutorial","text":"","category":"section"},{"location":"tutorials/#What-is-meta-programming?","page":"Tutorial","title":"What is meta programming?","text":"","category":"section"},{"location":"tutorials/#Analysis-Julia-expressions","page":"Tutorial","title":"Analysis Julia expressions","text":"","category":"section"},{"location":"tutorials/#Extract-function-name-of-a-simple-Julia-function","page":"Tutorial","title":"Extract function name of a simple Julia function","text":"","category":"section"},{"location":"tutorials/#Extract-conditions-of-an-ifelse-expression","page":"Tutorial","title":"Extract conditions of an ifelse expression","text":"","category":"section"},{"location":"tutorials/#Extract-loop-head","page":"Tutorial","title":"Extract loop head","text":"","category":"section"},{"location":"tutorials/#Transform-Julia-expressions","page":"Tutorial","title":"Transform Julia expressions","text":"","category":"section"},{"location":"tutorials/#Remove-LineNumberNode","page":"Tutorial","title":"Remove LineNumberNode","text":"","category":"section"},{"location":"tutorials/#Flatten-code-block-nodes","page":"Tutorial","title":"Flatten code block nodes","text":"","category":"section"},{"location":"tutorials/#Generate-Julia-expressions","page":"Tutorial","title":"Generate Julia expressions","text":"","category":"section"},{"location":"tutorials/#Generate-a-Julia-function","page":"Tutorial","title":"Generate a Julia function","text":"","category":"section"},{"location":"tutorials/#Generate-a-Julia-struct","page":"Tutorial","title":"Generate a Julia struct","text":"","category":"section"},{"location":"tutorials/#Generate-a-Julia-ifelse","page":"Tutorial","title":"Generate a Julia ifelse","text":"","category":"section"},{"location":"transform/#Transform","page":"Transform","title":"Transform","text":"","category":"section"},{"location":"transform/","page":"Transform","title":"Transform","text":"Some common transformations for Julia Expr, these functions takes an Expr and returns an Expr.","category":"page"},{"location":"transform/","page":"Transform","title":"Transform","text":"no_default\nprettify\nrm_lineinfo\nflatten_blocks\nname_only\nrm_annotations\nreplace_symbol\nsubtitute\neval_interp\neval_literal","category":"page"},{"location":"transform/#Expronicon.no_default","page":"Transform","title":"Expronicon.no_default","text":"const no_default = NoDefault()\n\nConstant instance for NoDefault that describes a field should have no default value.\n\n\n\n\n\n","category":"constant"},{"location":"transform/#Expronicon.prettify","page":"Transform","title":"Expronicon.prettify","text":"prettify(ex)\n\nPrettify given expression, remove all LineNumberNode and extra code blocks.\n\n\n\n\n\n","category":"function"},{"location":"transform/#Expronicon.rm_lineinfo","page":"Transform","title":"Expronicon.rm_lineinfo","text":"rm_lineinfo(ex)\n\nRemove LineNumberNode in a given expression.\n\n\n\n\n\n","category":"function"},{"location":"transform/#Expronicon.flatten_blocks","page":"Transform","title":"Expronicon.flatten_blocks","text":"flatten_blocks(ex)\n\nRemove hierachical expression blocks.\n\n\n\n\n\n","category":"function"},{"location":"transform/#Expronicon.name_only","page":"Transform","title":"Expronicon.name_only","text":"name_only(ex)\n\nRemove everything else leaving just names, currently supports function calls, type with type variables, subtype operator <: and type annotation ::.\n\nExample\n\njulia> using Expronicon\n\njulia> name_only(:(sin(2)))\n:sin\n\njulia> name_only(:(Foo{Int}))\n:Foo\n\njulia> name_only(:(Foo{Int} <: Real))\n:Foo\n\njulia> name_only(:(x::Int))\n:x\n\n\n\n\n\n","category":"function"},{"location":"transform/#Expronicon.rm_annotations","page":"Transform","title":"Expronicon.rm_annotations","text":"rm_annotations(x)\n\nRemove type annotation of given expression.\n\n\n\n\n\n","category":"function"},{"location":"transform/#Expronicon.eval_interp","page":"Transform","title":"Expronicon.eval_interp","text":"eval_interp(m::Module, ex)\n\nevaluate the interpolation operator in ex inside given module m.\n\n\n\n\n\n","category":"function"},{"location":"analysis/","page":"Analysis","title":"Analysis","text":"CurrentModule = Expronicon","category":"page"},{"location":"analysis/#Analysis","page":"Analysis","title":"Analysis","text":"","category":"section"},{"location":"analysis/","page":"Analysis","title":"Analysis","text":"Functions for analysing a given Julia Expr, e.g splitting Julia function/struct definitions etc.","category":"page"},{"location":"analysis/","page":"Analysis","title":"Analysis","text":"AnalysisError\nis_fn\nis_kw_fn\nis_literal\nsplit_function\nsplit_function_head\nsplit_struct\nsplit_struct_name\nsplit_ifelse\nannotations\nuninferrable_typevars\nhas_symbol","category":"page"},{"location":"analysis/#Expronicon.is_fn","page":"Analysis","title":"Expronicon.is_fn","text":"is_fn(def)\n\nCheck if given object is a function expression.\n\n\n\n\n\n","category":"function"},{"location":"analysis/#Expronicon.is_kw_fn","page":"Analysis","title":"Expronicon.is_kw_fn","text":"is_kw_fn(def)\n\nCheck if a given function definition supports keyword arguments.\n\n\n\n\n\n","category":"function"},{"location":"analysis/#Expronicon.is_literal","page":"Analysis","title":"Expronicon.is_literal","text":"is_literal(x)\n\nCheck if x is a literal value.\n\n\n\n\n\n","category":"function"},{"location":"analysis/#Expronicon.split_function","page":"Analysis","title":"Expronicon.split_function","text":"split_function(ex::Expr) -> head, call, body\n\nSplit function head declaration with function body.\n\n\n\n\n\n","category":"function"},{"location":"analysis/#Expronicon.split_function_head","page":"Analysis","title":"Expronicon.split_function_head","text":"split_function_head(ex::Expr) -> name, args, kw, whereparams\n\nSplit function head to name, arguments, keyword arguments and where parameters.\n\n\n\n\n\n","category":"function"},{"location":"analysis/#Expronicon.split_struct","page":"Analysis","title":"Expronicon.split_struct","text":"split_struct(ex::Expr) -> ismutable, name, typevars, supertype, body\n\nSplit struct definition head and body.\n\n\n\n\n\n","category":"function"},{"location":"analysis/#Expronicon.split_struct_name","page":"Analysis","title":"Expronicon.split_struct_name","text":"split_struct_name(ex::Expr) -> name, typevars, supertype\n\nSplit the name, type parameters and supertype definition from struct declaration head.\n\n\n\n\n\n","category":"function"},{"location":"codegen/#CodeGen","page":"CodeGen","title":"CodeGen","text":"","category":"section"},{"location":"codegen/","page":"CodeGen","title":"CodeGen","text":"Code generators, functions that generates Julia Expr from given arguments, Expronicon types. ","category":"page"},{"location":"codegen/","page":"CodeGen","title":"CodeGen","text":"codegen_ast\ncodegen_ast_kwfn\ncodegen_ast_struct\ncodegen_ast_struct_curly\ncodegen_ast_struct_head\ncodegen_ast_struct_body\ncodegen_match","category":"page"},{"location":"codegen/#Expronicon.codegen_ast_struct","page":"CodeGen","title":"Expronicon.codegen_ast_struct","text":"codegen_ast_struct(def)\n\nGenerate pure Julia struct Expr from struct definition. This is equivalent to codegen_ast for JLStruct. See also codegen_ast.\n\nExample\n\njulia> def = JLKwStruct(:(struct Foo\n           x::Int=1\n           \n           Foo(x::Int) = new(x)\n       end))\nstruct Foo\n    x::Int = 1\nend\n\njulia> codegen_ast_struct(def)\n:(struct Foo\n      #= REPL[21]:2 =#\n      x::Int\n      Foo(x::Int) = begin\n              #= REPL[21]:4 =#\n              new(x)\n          end\n  end)\n\n\n\n\n\n","category":"function"},{"location":"codegen/#Expronicon.codegen_ast_struct_curly","page":"CodeGen","title":"Expronicon.codegen_ast_struct_curly","text":"codegen_ast_struct_curly(def)\n\nGenerate the struct name with curly if it is parameterized.\n\nExample\n\njulia> using Expronicon\n\njulia> def = JLStruct(:(struct Foo{T} end))\nstruct Foo{T}\nend\n\njulia> codegen_ast_struct_curly(def)\n:(Foo{T})\n\n\n\n\n\n","category":"function"},{"location":"codegen/#Expronicon.codegen_ast_struct_head","page":"CodeGen","title":"Expronicon.codegen_ast_struct_head","text":"codegen_ast_struct_head(def)\n\nGenerate the struct head.\n\nExample\n\njulia> using Expronicon\n\njulia> def = JLStruct(:(struct Foo{T} end))\nstruct Foo{T}\nend\n\njulia> codegen_ast_struct_head(def)\n:(Foo{T})\n\njulia> def = JLStruct(:(struct Foo{T} <: AbstractArray end))\nstruct Foo{T} <: AbstractArray\nend\n\njulia> codegen_ast_struct_head(def)\n:(Foo{T} <: AbstractArray)\n\n\n\n\n\n","category":"function"},{"location":"codegen/#Expronicon.codegen_ast_struct_body","page":"CodeGen","title":"Expronicon.codegen_ast_struct_body","text":"codegen_ast_struct_body(def)\n\nGenerate the struct body.\n\nExample\n\njulia> def = JLStruct(:(struct Foo\n           x::Int\n           \n           Foo(x::Int) = new(x)\n       end))\nstruct Foo\n    x::Int\nend\n\njulia> codegen_ast_struct_body(def)\nquote\n    #= REPL[15]:2 =#\n    x::Int\n    Foo(x::Int) = begin\n            #= REPL[15]:4 =#\n            new(x)\n        end\nend\n\n\n\n\n\n","category":"function"},{"location":"codegen/#Expronicon.codegen_match","page":"CodeGen","title":"Expronicon.codegen_match","text":"codegen_match(f, x[, line::LineNumberNode=LineNumberNode(0), mod::Module=Main])\n\nGenerate a zero dependency match expression using MLStyle code generator, the syntax is identical to MLStyle.\n\nExample\n\ncodegen_match(:x) do\n    quote\n        1 => true\n        2 => false\n        _ => nothing\n    end\nend\n\nThis code generates the following corresponding MLStyle expression\n\n@match x begin\n    1 => true\n    2 => false\n    _ => nothing\nend\n\n\n\n\n\n","category":"function"},{"location":"#Expronicon","page":"Home","title":"Expronicon","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"(Image: Stable) (Image: Dev) (Image: Build Status) (Image: Coverage)","category":"page"},{"location":"","page":"Home","title":"Home","text":"Collective tools for metaprogramming on Julia Expr.","category":"page"},{"location":"printings/#Printings","page":"Printings","title":"Printings","text":"","category":"section"},{"location":"printings/","page":"Printings","title":"Printings","text":"Pretty printing functions.","category":"page"},{"location":"printings/","page":"Printings","title":"Printings","text":"with_marks\nwith_parathesis\nwith_curly\nwith_brackets\nwithin_line\nwithin_indent\nwith_begin_end\nindent\nno_indent\nno_indent_first_line\nindent_print\nindent_println","category":"page"},{"location":"printings/#Expronicon.with_marks","page":"Printings","title":"Expronicon.with_marks","text":"with_marks(f, io, lhs, rhs)\n\nPrint using f with marks specified on LHS and RHS by lhs and rhs. See also with_parathesis, with_curly, with_brackets, with_begin_end.\n\n\n\n\n\n","category":"function"},{"location":"printings/#Expronicon.with_parathesis","page":"Printings","title":"Expronicon.with_parathesis","text":"with_parathesis(f, io::IO)\n\nPrint with parathesis. See also with_marks, with_curly, with_brackets, with_begin_end.\n\nExample\n\njulia> with_parathesis(stdout) do\n        print(1, \", \", 2)\n    end\n(1, 2)\n\n\n\n\n\n","category":"function"},{"location":"printings/#Expronicon.with_curly","page":"Printings","title":"Expronicon.with_curly","text":"with_curly(f, io::IO)\n\nPrint with curly parathesis. See also with_marks, with_parathesis, with_brackets, with_begin_end.\n\n\n\n\n\n","category":"function"},{"location":"printings/#Expronicon.with_brackets","page":"Printings","title":"Expronicon.with_brackets","text":"with_brackets(f, io::IO)\n\nPrint with brackets. See also with_marks, with_parathesis, with_curly, with_begin_end.\n\n\n\n\n\n","category":"function"},{"location":"printings/#Expronicon.with_begin_end","page":"Printings","title":"Expronicon.with_begin_end","text":"with_begin_end(f, io::IO)\n\nPrint with begin ... end. See also with_marks, with_parathesis, with_curly, with_brackets.\n\n\n\n\n\n","category":"function"}]
}
