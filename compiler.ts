/**
 * Tokens
 */ 
module Compiler {
	export enum TokenId {
		Var,
		EqualsEquals,
		Equals,
		Identifier,
		Number,
		Semicolon,
		GreaterThan,
		GreaterThanEquals,
		LessThan,
		LessThanEquals,
		Comment
	};
	
	
	// Denote the 'Type' of the lexeme at a high level
	export enum LexemeType {
		// The token's lexeme' is constant, IE, something like a reserved word
		Constant,
		// The lexeme is dynamic, ie, an identifier or number will have variable length
		Dynamic
	};
	
	export class TokenDetail {
		constructor(public tokenId:TokenId, public lexemeType:LexemeType,
					public stringMatch:string, public tokenCreator) { }
	}
	
	export class Token {
		constructor(public tokenId: TokenId, public lexeme: string) {
		}
		
		public toString() {
			var tokenString = (<any>TokenId)._map[this.tokenId];
			return "[Token \"" + tokenString + "\" (" + this.tokenId + "), lexeme \"" + this.lexeme + "\"]";
		}
	}
	
	var GenericToken = (tokenId:TokenId) => {
		return (lexeme:string) => {
			return new Token(tokenId, lexeme);
		}
	}
	
	export class NumberToken extends Token {
		constructor(public lexeme: string) {
			super(TokenId.Number, lexeme)
		}
	}
	
	export class IdentifierToken extends Token {
		constructor(public lexeme: string) {
			super(TokenId.Identifier, lexeme)
		}
	}
	
	interface TokenCreator {
		new(lexeme:string): Token;
	}
	
	export class TokenInfoTable {
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
		
		public matchConstant(value) {
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
	
	export var tokenInfoTable = new TokenInfoTable();
	tokenInfoTable.addTokenInfo(TokenId.Var, LexemeType.Constant, "var");
	tokenInfoTable.addTokenInfo(TokenId.EqualsEquals, LexemeType.Constant, "==");
	tokenInfoTable.addTokenInfo(TokenId.Equals, LexemeType.Constant, "=");
	tokenInfoTable.addTokenInfo(TokenId.Identifier, LexemeType.Dynamic, "identifier");
	tokenInfoTable.addTokenInfo(TokenId.Number, LexemeType.Dynamic, "number");
	tokenInfoTable.addTokenInfo(TokenId.Semicolon, LexemeType.Constant, ";");
	tokenInfoTable.addTokenInfo(TokenId.GreaterThan, LexemeType.Constant, ">");
	tokenInfoTable.addTokenInfo(TokenId.GreaterThanEquals, LexemeType.Constant, ">=");
	tokenInfoTable.addTokenInfo(TokenId.LessThan, LexemeType.Constant, "<");
	tokenInfoTable.addTokenInfo(TokenId.LessThanEquals, LexemeType.Constant, "<=");
	tokenInfoTable.addTokenInfo(TokenId.Comment, LexemeType.Dynamic, "comment");
}

/**
 * Stream related - For consuming an input stream of characters
 * This may be extended to be used for consuming a stream of tokens too
 */
module Stream {
		export interface ICharacterStream {
			peek(): string;
			// Peek at second char in stream, just testing for now.
			peekPeek();
			nextChar(): string;
			// Attempts to match the peek value to the given string,
			// if true, consume the next character and return true
			// otherwise return false and do not modify the stream
			match(match:string):bool;
			nextWhile(predicate: (peek) => bool);
			hasNext(): bool;
			getLocation(): number;
		};
		
		export class CharacterStream implements ICharacterStream {
			private remainingInputString: string;
			private location:number;
			
			// Just fakes a stream but taking the entire string for now
			constructor(private inputString:string) {
				this.remainingInputString = inputString;
			}
			
			peek():string {
				return this.remainingInputString[0] || "";
			}
			
			// Peek at second char in stream, just testing for now.
			peekPeek():string {
				return this.remainingInputString[1] || "";	
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
		
}

/**
 * The lexer which consumes the input stream of the program
 * And returns the list of tokens that it has matched
 */ 
module Compiler {
	export class Lexer {
		hashTable;
		
		inputStream:Stream.ICharacterStream;
		
		constructor() {
		}
		
		public lex(input : string) {
			var inputStream = this.inputStream = new Stream.CharacterStream(input);
			this.hashTable = {};
	
			var tokens = [];
			while(inputStream.hasNext()) {
				var token : Token = this.scan();
				
				if(token == null) {
					alert("Failed to lex :: " + inputStream.nextWhile((peek) => true) + "\nSuccesful tokens were :: " + tokens.join("\n\t"));
					return undefined;
				}
				
				tokens.push(token);
			}
			
			return tokens;
		}
		
		private scan() : Token {
				var inputStream = this.inputStream;
				// Skip whitespaces
				// ignore all whitespaces
				inputStream.nextWhile((peek) => peek.match(/ /));
	
				// Return the first matching token for the input
				return this.scanComment(inputStream)
					|| this.scanNumber(inputStream)
					|| this.scanReservedWords(inputStream)
					|| this.scanOperators(inputStream);
		}
		
		private scanNumber(inputStream:Stream.ICharacterStream) {
			// Numbers
			if(inputStream.peek().match(/\d/)) {
				var entireNumber = inputStream.nextWhile((peek) => peek.match(/\d/));
				return tokenInfoTable.getDetail(TokenId.Number).tokenCreator(entireNumber);
			}
		}
		
		private scanReservedWords(inputStream:Stream.ICharacterStream) {
			// Match reserved words => word = letter(letter|digit)*
			// And identifiers
			if(inputStream.peek().match(/[a-z]/i)) {
	
				// Consume the entire word
				var matchedWord = inputStream.nextWhile((peek) => peek.match(/[a-z]|\d/i));
				// Attempt to match this against a constant, such as a reserved word
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
				
		private scanComment(inputStream:Stream.ICharacterStream) {
			// Match reserved words => word = letter(letter|digit)*
			// And identifiers
			if(inputStream.peek() == "/" && inputStream.peekPeek() == "*") {
				var commentCharArray = [];
				commentCharArray.push(inputStream.nextChar());
				commentCharArray.push(inputStream.nextChar());
				
				do {
					commentCharArray.push(inputStream.nextChar());
					if(inputStream.peek() == ""){
						alert("Invalid comment structure");
						return undefined;
					}
				} while(!(inputStream.peek() === "*" && inputStream.peekPeek() === "/"));
				commentCharArray.push(inputStream.nextChar());
				commentCharArray.push(inputStream.nextChar());
				
				var comment = commentCharArray.join("");
				
				return tokenInfoTable.getDetail(TokenId.Comment).tokenCreator(comment);
			}
		}
		
		private scanOperators(inputStream:Stream.ICharacterStream) {
			// Match operators			
			switch(inputStream.peek()) {
				case ';': return tokenInfoTable.getDetail(TokenId.Semicolon).tokenCreator(inputStream.nextChar());
				case '=':
					inputStream.nextChar();
					if(inputStream.match('=')) {
						return tokenInfoTable.getDetail(TokenId.EqualsEquals).tokenCreator("==");
					} else {
						return tokenInfoTable.getDetail(TokenId.Equals).tokenCreator("=");
					}
				case '>':
					inputStream.nextChar();
					if(inputStream.match('=')) {
						return tokenInfoTable.getDetail(TokenId.GreaterThanEquals).tokenCreator(">=");
					} else {
						return tokenInfoTable.getDetail(TokenId.GreaterThan).tokenCreator(">");
					}
				case '<':
					inputStream.nextChar();
					if(inputStream.match('=')) {
						return tokenInfoTable.getDetail(TokenId.LessThanEquals).tokenCreator("<=");
					} else {
						return tokenInfoTable.getDetail(TokenId.LessThan).tokenCreator("<");
					}		
			}		
			
		}
}
}

module Compiler {
	export class Parser {
		public parse(tokens: Token[]) {
			
		}
	}
}

module Compiler {
	// Attempting to match the following string
	var testMatch = ""
		+ "/******************************************"
		+ "* Comment Test"
		+ "*******************************************/"
		+ "var foo = 10;"
		+ "var bar = 20;" 
		+ "var isEqual = foo == bar;" 
		// Greater
		+ "var isGreaterThan = foo > bar;" 
		+ "var isGreaterThanOrEqual = foo >= bar;" 
		// Less
		+ "var isLessThan = foo < bar;" 
		+ "var isLessThanOrGreater = foo <= bar;";
		
	// Firstly lex and grab all of the tokens (composed of token id and Lexeme)
	var tokens:Token[] =  new Lexer().lex(testMatch);
	// Pipe into the next stage, the parser
	new Parser().parse(tokens);
	

	//alert("Matching tokens for parsing are ::\n\n\t" + tokens.join("\n\t"));
}


	
