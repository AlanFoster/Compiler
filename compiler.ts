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
		
	constructor(key : string, value : TokenType) {
		
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
		this.addTokenMatch(TokenType.Semicolon, ";");
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

		var tokenPairs = [];
		while(this.tail != undefined) {
			// Clear buffer
			this.buffer = [];
			
			var tokenPair : TokenPair = this.scan();
			
			if(tokenPair == null) {
				alert("Failed to match lex :: " + this.head + " " + this.tail);
				return;
			}
			
			tokenPairs.push(tokenPair);
		}
		
		alert("Matching tokens are ::\n\n" + tokenPairs.join("\n\t"));

		this.scan();
	}

	private peek() {
		var nextChar = this.tail[0];
		return nextChar;
	}
	
	private consumeToBuffer() {
		var nextChar : string = this.next();
		this.buffer.push(nextChar);
		
		return nextChar;
	}
	
	private next() {
		this.head = this.tail[0];
		this.tail = this.tail.substr(1);
		this.pointer++;
		
		return this.head;
	}
	
	private scan() : TokenPair {
			// Skip whitespaces
			// ignore all whitespaces
			while(this.peek().match(/ /)) {
				this.next();
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
				// Test if we have a matching token operator/reserved word
				// otherwise it is an idenitifer		
				if(matchedIndex) {
					return new TokenPair(((<any> TokenType)._map[matchedIndex]), bufferedWord);
				} else {
					return new TokenPair(((<any> TokenType)._map[TokenType.Identifier]), bufferedWord);
				}
			}
			
			// Operators
			switch(this.peek()) {
				case ';': return new TokenPair(((<any> TokenType)._map[TokenType.Semicolon]), this.next());
				case '=': 
					this.next();
					if(this.peek() == '=') {
						this.next();
						return new TokenPair(((<any> TokenType)._map[TokenType.EqualsEquals]), "==");
					} else {
						return new TokenPair(((<any> TokenType)._map[TokenType.Equals]), "=");
					}
			}
			
			// Numbers
			if(this.peek().match(/\d/)) {
				while(this.peek().match(/\d/)) {
					this.consumeToBuffer();
				}
				var entireNumber = this.buffer.toString();
				return new TokenPair(((<any> TokenType)._map[TokenType.Number]), entireNumber);
			}
			
			return undefined;
	}
}

// Attempting to match the following string
var testMatch = "var foobar = 10;";
new Lexer().lex(testMatch);