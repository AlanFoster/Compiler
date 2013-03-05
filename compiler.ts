enum TokenType {
	Var,
	EqualsEquals,
	Equals,
	Identifier,
	Number,
	Semicolon
};

class TokenPair {
	constructor(public tokenType: TokenType, public lexeme: string) {
		
	}
	
	public toString() {
		return "[tokenType \"" + this.tokenType + "\", lexeme \"" + this.lexeme + "\"]";
	}
}

class TokenMatch {
	constructor(public tokenType: TokenType, public text:string) {
		
	}
}

class TokenHashTable {
	constructor(key : string, pair : any) {
		
	}
}


class Tokens {
	private tokenTable : TokenMatch[] = [];
	
	constructor() {
		this.addTokenMatch(TokenType.Var, "var");
		
		this.addTokenMatch(TokenType.EqualsEquals, "==");
		this.addTokenMatch(TokenType.Equals, "=");
		this.addTokenMatch(TokenType.Identifier, "identifier");
		this.addTokenMatch(TokenType.Number, "number");
		this.addTokenMatch(TokenType.Semicolon, "semicolon");
	}
	
	private addTokenMatch(tokenType : TokenType, text:string) {
		this.tokenTable[tokenType] = new TokenMatch(tokenType, text);
	}
	
	public getTokenTable() {
		return this.tokenTable;
	}
}

class Lexer {
	tokens:Tokens = new Tokens();

	lineNumber;
	pointer;
	head: string;
	buffer: string[];
	tail:string;
	words = [];

	hashTable;
	
	constructor() {
	}
	
	public lex(input : string) {
		this.pointer = 0;
		this.lineNumber = 0;
		this.buffer = [];
		this.head = undefined;
		this.tail = input;
		this.hashTable = {};

		for(var i in (<any>TokenType)._map) {
			this.hashTable[(<any> TokenType)._map[i].toLowerCase()] = i;
		};


		while(this.tail != undefined) {
			var token : TokenPair = this.scan();
			
			
			if(token == null) {
				alert("Failed to match lex :: " + this.head + " " + this.tail);
				return;
			}
			
		}

		this.scan();
	}

	private peek() {
		var nextChar = this.tail[this.pointer];
		return nextChar;
	}
	
	private consumeToBuffer() {
		var nextChar : string = this.tail[this.pointer];
		this.pointer++;
		this.buffer.push(nextChar);
		
		return nextChar;
	}
	
	private next() {
		this.head = this.tail[0];
		this.tail = this.tail.substr(1);
		
		return this.head;
	}
	
	private scan() : TokenPair {
			// Skip whitespaces
			if(this.peek().match(/ /)) {
				// ignore all whitespaces
				while(this.next().match(/ /)) {
					alert("inside?");
					;
				}
			}
	
			// Match reserved words => word = letter(letter|digit)*
			if(this.peek().match(/[a-z]/i)) {
				// Consume the rest
				while(this.peek().match(/[a-z]|\d/i)) {
					this.consumeToBuffer();
				}
	
				// Check if it exists in our reserved word list
				var bufferedWord = this.buffer.join("").toLowerCase();
	
				var matchedIndex = this.hashTable[bufferedWord];
				if(matchedIndex) {
					return new TokenPair(((<any> TokenType)._map[matchedIndex]), bufferedWord);
				}
			}

			

	}
}

// Attempting to match the following string
var testMatch = "var varIdentifier = 10;";
new Lexer().lex(testMatch);