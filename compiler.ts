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

interface ICharacterStream {
	peek(): string;
	nextChar(): string;
	nextWhile(predicate: (peek) => bool);
	hasNext(): bool;
	getLocation(): number;
}

class CharacterStream implements ICharacterStream {
	private remainingInputString: string;
	private location:number;
	
	// Just fakes a stream but taking the entire string for now
	constructor(private inputString:string) {
		this.remainingInputString = inputString;
	}
	
	peek():string {
		return this.remainingInputString[0] || "";
	}
	
	nextChar():string {
		var currentChar = this.remainingInputString[0]; 
		this.remainingInputString = this.remainingInputString.substr(1);
		this.location++;
		return currentChar;
	}
	
	nextWhile(predicate: (peek) => bool):string {
		var bufferedChar = []
		while(this.hasNext() && predicate(this.peek())){
			bufferedChar.push(this.nextChar());
		}
		
		var bufferedString = bufferedChar.join("");
		return bufferedString;
	}
	
	hasNext() {
		return this.peek() !== "";
	}
	
	getLocation() {
		return this.location;
	}
}



class Lexer {
	tokens:Tokens = new Tokens();

	hashTable;
	
	inputStream:ICharacterStream;
	
	constructor() {
	}
	
	public lex(input : string) {
		var inputStream = this.inputStream = new CharacterStream(input);
		this.hashTable = {};

		for(var i in (<any>TokenType)._map) {
			this.hashTable[(<any> TokenType)._map[i].toLowerCase()] = i;
		};

		var tokenPairs = [];
		while(inputStream.hasNext()) {
			
			var tokenPair : TokenPair = this.scan();
			
			if(tokenPair == null) {
				alert("Failed to lex :: " + inputStream.nextWhile((peek) => true));
				return;
			}
			
			tokenPairs.push(tokenPair);
		}
		
		alert("Matching tokens are ::\n\n\t" + tokenPairs.join("\n\t"));

		this.scan();
	}
	
	private scan() : TokenPair {
			var inputStream = this.inputStream;
			// Skip whitespaces
			// ignore all whitespaces
			inputStream.nextWhile((peek) => peek.match(/ /));

			// Numbers
			if(inputStream.peek().match(/\d/)) {
				var entireNumber = inputStream.nextWhile((peek) => peek.match(/\d/));
				return new TokenPair(((<any> TokenType)._map[TokenType.Number]), entireNumber);
			}
			
			// Match reserved words => word = letter(letter|digit)*
			// And identifiers
			if(inputStream.peek().match(/[a-z]/i)) {

				// Consume the entire word
				var matchedWord = inputStream.nextWhile((peek) => peek.match(/[a-z]|\d/i));
		
				// TODO Make hashmap which case ignores by default
				var matchedIndex = this.hashTable[matchedWord.toLowerCase()];
				// Test if we have a matching token operator/reserved word
				// otherwise it is an idenitifer		
				if(matchedIndex) {
					return new TokenPair(((<any> TokenType)._map[matchedIndex]), matchedWord);
				} else {
					return new TokenPair(((<any> TokenType)._map[TokenType.Identifier]), matchedWord);
				}
			}
			
			// Match operators
			switch(inputStream.peek()) {
				case ';': return new TokenPair(((<any> TokenType)._map[TokenType.Semicolon]), inputStream.nextChar());
				case '=': 
					inputStream.nextChar();
					if(inputStream.peek() == '=') {
						inputStream.nextChar();
						return new TokenPair(((<any> TokenType)._map[TokenType.EqualsEquals]), "==");
					} else {
						return new TokenPair(((<any> TokenType)._map[TokenType.Equals]), "=");
					}
			}
			

			return undefined;
	}
}

// Attempting to match the following string
var testMatch = "var isEqual = 10 == 10;";
new Lexer().lex(testMatch);