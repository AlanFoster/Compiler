enum TokenId {
	Var,
	EqualsEquals,
	Equals,
	Identifier,
	Number,
	Semicolon
};

class TokenInfoTable {
	tokenInfo = {};
	constructor() {
		this.tokenInfo = {};
	}
	
	public addTokenInfo(tokenId:TokenId, value: string) {
		this.tokenInfo[tokenId] = { tokenId:tokenId, value: value}; 
	};
	
	public getKeyFromValue(value:any) {
		var tokenInfo = this.tokenInfo;
		for(var key in tokenInfo) {
			if(tokenInfo[key] && tokenInfo[key].value == value) {
				return tokenInfo[key].tokenId;
			}
		}
		return undefined;
	}
	
};

var tokenInfoTable = new TokenInfoTable();
tokenInfoTable.addTokenInfo(TokenId.Var, "var");
tokenInfoTable.addTokenInfo(TokenId.EqualsEquals, "==");
tokenInfoTable.addTokenInfo(TokenId.Equals, "=");
tokenInfoTable.addTokenInfo(TokenId.Identifier, "identifier");
tokenInfoTable.addTokenInfo(TokenId.Number, "number");
tokenInfoTable.addTokenInfo(TokenId.Semicolon, ";");

// The static values - Where 'static' in this case means unchanging.
// IE reserved words, operators, but not something like an identifier
// ...

class Token {
	constructor(public tokenType: TokenId, public lexeme: string) {
	}
	
	public toString() {
		return "[tokenType \"" + this.tokenType + "\", lexeme \"" + this.lexeme + "\"]";
	}
}

class NumberToken extends Token {
	constructor(public lexeme: string) {
		super(TokenId.Number, lexeme)
	}
}

class IdentifierToken extends Token {
	constructor(public lexeme: string) {
		super(TokenId.Identifier, lexeme)
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
	hashTable;
	
	inputStream:ICharacterStream;
	
	constructor() {
	}
	
	public lex(input : string) {
		var inputStream = this.inputStream = new CharacterStream(input);
		this.hashTable = {};

		/*for(var i in (<any>TokenType)._map) {
			this.hashTable[(<any> TokenType)._map[i].toLowerCase()] = i;
		};*/

		var tokens = [];
		while(inputStream.hasNext()) {
			
			var token : Token = this.scan();
			
			if(token == null) {
				alert("Failed to lex :: " + inputStream.nextWhile((peek) => true) + "\nSuccesful tokens were :: " + tokens.join("\n\t"));
				return;
			}
			
			tokens.push(token);
		}
		
		alert("Matching tokens are ::\n\n\t" + tokens.join("\n\t"));

		this.scan();
	}
	
	private scan() : Token {
			var inputStream = this.inputStream;
			// Skip whitespaces
			// ignore all whitespaces
			inputStream.nextWhile((peek) => peek.match(/ /));

			// Numbers
			if(inputStream.peek().match(/\d/)) {
				var entireNumber = inputStream.nextWhile((peek) => peek.match(/\d/));
				return new NumberToken(entireNumber);
			}
			
			// Match reserved words => word = letter(letter|digit)*
			// And identifiers
			if(inputStream.peek().match(/[a-z]/i)) {

				// Consume the entire word
				var matchedWord = inputStream.nextWhile((peek) => peek.match(/[a-z]|\d/i));
		
				// TODO Make hashmap which case ignores by default
				var matchedKey = tokenInfoTable.getKeyFromValue(matchedWord);
				// Test if we have a matching token operator/reserved word
				// otherwise it is an idenitifer		
				if(matchedKey) {
					return new Token(matchedKey, matchedWord);
				} else {
					return new IdentifierToken(matchedWord);
				}
			}
			
			// Match operators
			/*switch(inputStream.peek()) {
				case ';': return new TokenPair(((<any> TokenType)._map[TokenType.Semicolon]), inputStream.nextChar());
				case '=': 
					inputStream.nextChar();
					if(inputStream.peek() == '=') {
						inputStream.nextChar();
						return new TokenPair(((<any> TokenType)._map[TokenType.EqualsEquals]), "==");
					} else {
						return new TokenPair(((<any> TokenType)._map[TokenType.Equals]), "=");
					}
			}*/

			return undefined;
	}
}

// Attempting to match the following string
var testMatch = "var isEqual = 10 == 10;";
new Lexer().lex(testMatch);