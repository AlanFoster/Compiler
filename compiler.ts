enum TokenId {
	Var,
	EqualsEquals,
	Equals,
	Identifier,
	Number,
	Semicolon
};

// Denote the 'Type' of the lexeme at a high level
enum LexemeType {
	// The token's lexeme' is constant, IE, something like a reserved word
	Constant,
	// The lexeme is dynamic, ie, an identifier or number will have variable length
	Dynamic
};

class TokenDetail {
	constructor(public tokenId:TokenId, public lexemeType:LexemeType,
				public stringMatch:string, public tokenCreator) { }
}

class Token {
	constructor(public tokenId: TokenId, public lexeme: string) {
	}
	
	public toString() {
		return "[tokenType \"" + this.tokenId + "\", lexeme \"" + this.lexeme + "\"]";
	}
}

var GenericToken = (tokenId:TokenId) => {
	return (lexeme:string) => {
		return new Token(tokenId, lexeme);
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

interface TokenCreator {
	new(lexeme:string): Token;
}

class TokenInfoTable {
	tokenInfo : { };
	constructor() {
		this.tokenInfo = {};
	}
	
	public addTokenInfo(tokenId:TokenId, lexemeType: LexemeType, value: string, tokenCreator?) {
		if(!tokenCreator) {
			tokenCreator = GenericToken(tokenId);
		}
		this.tokenInfo[tokenId] = new TokenDetail(tokenId, lexemeType, value, tokenCreator);
	};
	
	public matchConstant(value:any) {
		var tokenInfo = this.tokenInfo;
		for(var key in tokenInfo) {
			if(tokenInfo[key] && tokenInfo[key].value == value) {
				return tokenInfo[key].tokenId;
			}
		}
		return undefined;
	}
		
	public getDetail(tokenId: TokenId):TokenDetail {
		return this.tokenInfo[tokenId];
	}
	
};

var tokenInfoTable = new TokenInfoTable();
tokenInfoTable.addTokenInfo(TokenId.Var, LexemeType.Constant, "var");
tokenInfoTable.addTokenInfo(TokenId.EqualsEquals, LexemeType.Constant, "==");
tokenInfoTable.addTokenInfo(TokenId.Equals, LexemeType.Constant, "=");
tokenInfoTable.addTokenInfo(TokenId.Identifier, LexemeType.Dynamic, "identifier");
tokenInfoTable.addTokenInfo(TokenId.Number, LexemeType.Dynamic, "number");
tokenInfoTable.addTokenInfo(TokenId.Semicolon, LexemeType.Constant, ";");




interface ICharacterStream {
	peek(): string;
	nextChar(): string;
	// Attempts to match the peek value to the given string,
	// if true, consume the next character and return true
	// otherwise return false and do not modify the stream
	match(match:string):bool;
	nextWhile(predicate: (peek) => bool);
	hasNext(): bool;
	getLocation(): number;
};

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
	
	match(match:string):bool {
		var isMatch = this.peek() == match;
		if(isMatch) {
			this.nextChar();
		}
		return isMatch;
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

			return this.scanNumber(inputStream)
				|| this.scanReservedWords(inputStream)
				|| this.scanOperators(inputStream);
	}
	
		private scanNumber(inputStream:ICharacterStream) {
		// Numbers
		if(inputStream.peek().match(/\d/)) {
			var entireNumber = inputStream.nextWhile((peek) => peek.match(/\d/));
			return tokenInfoTable.getDetail(TokenId.Number).tokenCreator(entireNumber);
		}
	}
	
	private scanReservedWords(inputStream:ICharacterStream) {
		// Match reserved words => word = letter(letter|digit)*
		// And identifiers
		if(inputStream.peek().match(/[a-z]/i)) {
			// Consume the entire word
			var matchedWord = inputStream.nextWhile((peek) => peek.match(/[a-z]|\d/i));

			var constantToken:TokenDetail = tokenInfoTable.matchConstant(matchedWord);
			// Test if we have a matching token operator/reserved word
			// otherwise it is an idenitifer		
			if(constantToken) {
				return constantToken.tokenCreator(matchedWord); 
			} else {
				return tokenInfoTable.getDetail(TokenId.Identifier).tokenCreator(matchedWord);
			}
		}
	}
	
	private scanOperators(inputStream:ICharacterStream) {
		// Match operators			
		switch(inputStream.peek()) {
			case ';': return new Token(TokenId.Semicolon, inputStream.nextChar());
			case '=': 
				inputStream.nextChar();
				if(inputStream.match('=')) {
					return tokenInfoTable.getDetail(TokenId.EqualsEquals).tokenCreator("==");
				} else {
					return tokenInfoTable.getDetail(TokenId.Equals).tokenCreator("=");
				}
		}		
	}
	
	
	
	
}

// Attempting to match the following string
var testMatch = "var isEqual = 10 == 10;";
new Lexer().lex(testMatch);