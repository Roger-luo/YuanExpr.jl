using Test
using MLStyle
using Expronicon
using Expronicon.ADT: ADTTypeDef, @adt, @type, adt_property_masks

@macroexpand @adt begin
    
    @type struct Term end
    struct sym
        value::Symbol
    end

    struct expr
        head::Symbol
        args::Vector{Any}
    end
end

@adt Message begin
    Quit
    struct Move
        x::Int32
        y::Int32
    end

    Write(::String)
    ChangeColor(::Int32, ::Int32, ::Int32)
end

struct Message
    type::Int32
    d1::Int32
    d2::Int32
    d4::Int32
    d3::Ptr{Cvoid}
end

Write(s::String) = Message(2, 0, 0, 0, pointer(s))


Quit = Message(QuitType, nothing, nothing, nothing)
Move = Message(MoveType, 1, 2, nothing)
Write = Message(WriteType, "Hello", nothing, nothing)


x = expr(:+, Any[1, 2, 3])



macroexpand(Main, :(@match x begin
    ::Term.sym => 1
    ::Term.expr => 0
end); recursive=false)

@match x begin
    ::Term.sym => 1
    ::Term.expr => 0
end

Term(type=expr, head=:+, args=Any[1, 2, 3])



@enum Domain begin
    OP
    INDEX # operator index place holder
    INT
    REAL
    COMPLEX
    NUM
    ANY
    NONE
end

@adt begin
    @type struct Term
    end

    struct literal
        name::Symbol
    end

    struct sym
        name::Symbol
        domain::Domain = NONE
        guard = nothing
    end

    # alias will not be considered equal to term
    # in canonical form so it won't get replaced
    # right away in addition dict so it acts like
    # literal operators.
    # this can be easily undo by a subtitution.
    struct alias
        name::Symbol
        term
    end

    # efficient operation string for add/mul/kron
    # hash value is lazily stored for efficiency
    struct opstring
        opname::Symbol
        coeff
        dict::Dict{Any, Any} = Dict{Any, Any}()
        hash::Base.RefValue{UInt} = Ref{UInt}(0)
    end

    struct pow
        opname::Symbol
        base
        exp
    end

    struct reduction
        opname::Symbol
        args::Vector{Any} = []# list of sym
        region
        term # Term
        hash::Base.RefValue{UInt} = Ref{UInt}(0)

        function reduction(opname, args, region, term, hash)
            opname in [:+, :*] || throw(ArgumentError("wrong!"))
            new(opname, args, region, term, hash)
        end
    end

    # NOTE: indices should be either Int or Term(:variable)
    struct subscript
        term
        indices
        hash::Base.RefValue{UInt} = Ref{UInt}(0)
    end
    struct builtin
        name::Symbol
        args::Vector{Any} = []
        hash::Base.RefValue{UInt} = Ref{UInt}(0)
    end
end

t = subscript(;term=sym(name=:test), indices=[])

@testset "test reflection" begin
    @test adt_property_masks(sym) == (2, 3, 4)
    @test adt_property_masks(subscript) == (2, 4, 5)
    @test adt_property_masks(builtin) == (2, 4, 5)
end

@testset "test @type throw" begin
    ex = @expr begin
        struct wrong end
    end
    @test_throws ArgumentError ADTTypeDef(Main, ex)    
end

@testset "test patterns" begin
    t = subscript(;term=sym(name=:test), indices=[])

    @test @match t begin
        subscript(_...) => true
        _ => false
    end

    answer = @match t begin
        subscript(term, indices, _) => (term, indices)
        _ => false
    end
    @test answer[1].name === t.term.name
    @test answer[2] == []

    answer = @match t begin
        subscript(;term, indices) => (term, indices)
        _ => false
    end
    @test answer[1].name === t.term.name
    @test answer[2] == []

    answer = @match t begin
        subscript(;term, indices=[]) => term
        _ => false
    end
    @test answer.name === t.term.name

    answer = @match t begin
        subscript(term=term, indices=[]) => term.name
        _ => false
    end
    @test answer === t.term.name

    t = opstring(opname=:*, coeff=1)

    @test @match t begin
        opstring(;opname=:*) => true
        _ => false
    end

    t = sym(name=:test)
    @test @match t begin
        opstring(opname=:*) => false
        _ => true
    end
end


@testset "ADTTypeDef" begin
    ex = @expr begin
        # TODO: let's think about how to
        # support enum types later so we have
        # the full rust enum.
    
        # X = "Something"
        # Y = "Something else"
        @type struct TestExpr
            shared::String
        end
    
        struct test_literal
            name::Symbol
    
            function test_literal(name::Symbol)
                new(name)
            end
        end
    
        struct test_pow
            opname::Symbol
            base
            exp
        end
    end

    def = ADTTypeDef(Main, ex)
    show(stdout, MIME"text/plain"(), def)
    @test def.m === Main
    @test def.nshared_fields == 1
    @test def.type_masks[:test_literal] == [3]
    @test def.type_masks[:test_pow] == [3, 4, 5]
    literal_type = def.types[1]
    @test literal_type.name === :test_literal
    @test_expr codegen_ast(literal_type.constructors[1]) == @expr function test_literal(name::Symbol)
        new(name)
    end
    @test literal_type.fields[1] == JLKwField(name=:name, type=Symbol)

    pow_type = def.types[2]
    @test pow_type.name === :test_pow
    @test isempty(pow_type.constructors) # only default
    @test pow_type.fields[1] == JLKwField(name=:opname, type=Symbol)
end
