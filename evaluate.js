/* indexOf() like function for regular expressions. Return the index of the 
first match found AFTER pos, otherwise return -1 */
function regexIndexOf(string, regex, pos) {
    if (string.substring(pos).search(regex) < 0) {
        return -1;
    }
    else {
        return string.substring(pos).search(regex) + pos;
    }
}

/* indexOf() like function for regular expressions. Return the index of the 
first match found BEFORE max, otherwise return -1 */
function regexWithMax(string, regex, max) {
    if (string.substring(0, max).search(regex) < 0) {
        return -1;
    }
    else {
        return string.substring(0, max).search(regex);
    }
}

/* calculate(input) takes in a string expression passed in from parse(). The expression is either 
enclosed with parenthesis or consists of the entire expression if --> A) it didn't have parenthesis
to begin with or B) all parenthesis have since then been parsed and replaced */
function calculate(input) {
    /****** EDIT INPUT INTO A UNIFORM AND REGCONIZABLE EXPRESSION ******/
    //replace all whitespace and parenthesis with empty strings --> this gets rid of them
    let output = input.replace(/ |[\(\)\[\]\{\}]/g, '');
    //replace different forms of writing a minus symbol with a '-', so that formatting remains uniform across all expressions
    output = output.replace(/[-˗−﹣－]/g, '-');
    /*replace all minus symbols that are immediately preceded by digit(s) with underscores --> this helps differentiate 
    between negative signs and minus signs. Negative signs are not immediately preceded by digits, while minus symbols are. 
    Underscores will represent substraction, while minus symbols will represent negative signs. */
    const subtractionOperatorRegex = /[0-9](?=-)/;
    if (subtractionOperatorRegex.test(output)) {
        let index = output.search(subtractionOperatorRegex);
        output = output.substring(0, index + 1) + "_" + output.substring(index + 2);
    }
    // replace different ways of writing a multiplication symbol with a '*', so that the formatting remains uniform across all expressions 
    output = output.replace(/[x×·✕]/g, '*');
    // replace the alternate way of writing a division symbol with a '/', so that the formatting remains uniform across all expressions
    output = output.replace(/÷/g, '/');
    
    /****** DECLARE AND INITIALIZE REGULAR EXPRESSIONS *******/
    // matches all operations: exponentiation, multiplication, division, addition, subtraction
    const operationsRegex = /[\^\*\/\+\_]/;
    // matches the nearest operator to the left of an exponentiation operator
    const precedingExp = /[\*\/\+\_](?=[0-9-]+\^)/;
    // matches the nearest operator to the left of a multiplication operator
    const precedingMult = /[\^\/\+\_](?=[0-9-]+\*)/;
    // matches the nearest operator to the left of a division operator
    const precedingDiv = /[\^\*\+\_](?=[0-9-]+\/)/;
    // matches the nearest operator to the left of an addition operator
    const precedingAdd = /[\^\*\/\_](?=[0-9-]+\+)/;
    // matches the nearest operator to the left of a subtraction operator
    const precedingSub = /[\^\*\/\+](?=[0-9-]+\_)/;

    /****** STEP BY STEP EVALUATION FOLLOWING PEMDAS RULES ******/
    // while there are still operators in the string
    while (operationsRegex.test(output)) {
        if (output.indexOf('^') >= 0) {
            let pos = output.indexOf('^');
            // find the nearest operator to the left of the exponentiation operator. If it returns -1, 
            // this means that the exponent operator is the first operator in the string. 
            let leftBound = regexWithMax(output, precedingExp, pos + 1);
            let rightBound = (regexIndexOf(output, operationsRegex, pos + 1) >= 0) ? regexIndexOf(output, operationsRegex, pos + 1) : output.length;
            // parse the substrings formed by leftBound, pos, and rightBound into numbers
            let first = parseFloat(output.substring(leftBound + 1, pos));
            let second = parseFloat(output.substring(pos + 1, rightBound));
            //calculation
            let num = first ** second;
            //replace the entirety of the exponent expression with the calculated number num
            output = output.replace(output.substring(leftBound + 1, rightBound), num);
        }

        /***** NOTES *******/
        /* it is important to use regexWithMax for determining the value of leftBound. If regexWithMax is not
        used, the regular expression may potentially match with instances of the same operator that are further down in the string. 
        For example: we have ^ that is the first operator in the string. Further down in the string, we have
        another ^ that is most closely preceded with a + operator. Without regexWithMax limiting the max position 
        of the search area, instead of returning -1 as the leftBound for the first instance of ^, it will
        return the index of the + as it is a match for the regex precedingExp (it is the nearest operator to the left of a ^, 
        even though it's not the correct instance of ^. */
        /*  leftBound would be assigned -1 if there are no operators that precede pos, meaning that the operator at pos
        is the first operator in the string expression. The -1 does not become problematic because when parsing 
        the variable first, the first digit would be at leftBound + 1, which equals 0 if leftBound is -1.
        The first number of the expression should start at index 0, because if leftBound === -1, it means that expression 
        is the first one in the string. */
        
        //condiionals also make sure that multiplication/division and addition/subtraction is evaluated from left --> right
        else if (output.indexOf('*') >= 0 && (output.indexOf('*') < output.indexOf('/') || output.indexOf('/') === -1)) {
            let pos = output.indexOf('*');
            // find the nearest operator to the left of the multiplication operator. If it returns -1, 
            // this means that the multiplication operator is the first operator in the string.
            let leftBound = regexWithMax(output, precedingMult, pos + 1);
            let rightBound = (regexIndexOf(output, operationsRegex, pos + 1) >= 0) ? regexIndexOf(output, operationsRegex, pos + 1) : output.length;
            // parse the substrings formed by leftBound, pos, and rightBound into numbers
            let first = parseFloat(output.substring(leftBound + 1, pos));
            let second = parseFloat(output.substring(pos + 1, rightBound));
            //calculation
            let num = first * second;
            // replace the entirety of the multiplication expression with the calculated number num
            output = output.replace(output.substring(leftBound + 1, rightBound), num);
        }
        else if (output.indexOf('/') >= 0 && (output.indexOf('/') < output.indexOf('*') || output.indexOf('*') === -1)) {
            let pos = output.indexOf('/');
            // find the nearest operator to the left of the division operator. If it returns -1, 
            // this means that the division operator is the first operator in the string.
            let leftBound = regexWithMax(output, precedingDiv, pos + 1);
            let rightBound = (regexIndexOf(output, operationsRegex, pos + 1) >= 0) ? regexIndexOf(output, operationsRegex, pos + 1) : output.length;
            // parse the substrings formed by leftBound, pos, and rightBound into numbers
            let first = parseFloat(output.substring(leftBound + 1, pos));
            let second = parseFloat(output.substring(pos + 1, rightBound));
            //calculate
            let num = first / second;
            // replace the entirety of the division expression with the calculated number num
            output = output.replace(output.substring(leftBound + 1, rightBound), num);
        }
        else if (output.indexOf('+') >= 0 && (output.indexOf('+') < output.indexOf('_') || output.indexOf('_') === -1)) {
            let pos = output.indexOf('+');
            // find the nearest operator to the left of the addition operator. If it returns -1, 
            // this means that the addition operator is the first operator in the string.
            let leftBound = regexWithMax(output, precedingAdd, pos + 1);
            let rightBound = (regexIndexOf(output, operationsRegex, pos + 1) >= 0) ? regexIndexOf(output, operationsRegex, pos + 1) : output.length;
            // parse the substrings formed by leftBound, pos, and rightBound into numbers
            let first = parseFloat(output.substring(leftBound + 1, pos));
            let second = parseFloat(output.substring(pos + 1, rightBound));
            //calculate
            let num = first + second;
            // replace the entirety of the addition expression with the calculated number num
            output = output.replace(output.substring(leftBound + 1, rightBound), num);
        }
        else {
            let pos = output.indexOf('_');
            // find the nearest operator to the left of the subtraction operator. If it returns -1, 
            // this means that the subtraction operator is the first operator in the string.
            let leftBound = regexWithMax(output, precedingSub, pos + 1);
            let rightBound = (regexIndexOf(output, operationsRegex, pos + 1) >= 0) ? regexIndexOf(output, operationsRegex, pos + 1) : output.length;
            // parse the substrings formed by leftBound, pos, and rightBound into numbers
            let first = parseFloat(output.substring(leftBound + 1, pos));
            let second = parseFloat(output.substring(pos + 1, rightBound));
            // calculate
            let num = first - second;
            // replace the entirety of the subtraction expression with the calculated number num
            output = output.replace(output.substring(leftBound + 1, rightBound), num);
        }
    }
    return output;

}

/* parse(): parsing through the user-inputted string expression and sending expressions enclosed with 
parenthesis to calculate(). Once all parenthesis are parsed, send the entire expression to calculate() to 
receive a single number result */
function parse() {
    let input = document.getElementById('stringExpression').value;

    /****** DECLARE AND INITIALIZE REGULAR EXPRESSIONS ******/
    // matches all parenthesis and brackets: () {} []
    const parenthesisRegex = /[\(\)\[\]\{\}]/;
    // matches all opening parenthesis and brackets
    const openparenRegex = /[\(\[\{]/;
    // matches all closing parenthesis and brackets
    const closeparenRegex = /[\)\]\}]/;
    
    //getting rid of whitespace
    let output = input.replace(/ /g, '');
    let startPos = 0;
    let endPos = output.length;
    
    /****** TESTING IF ALL BRACKETS AND PARENTHESIS ARE PAIRED ******/
    let count = 0;
    for (let i = 0; i < output.length; i++) {
        if (output.charAt(i) === '(' || output.charAt(i) === '[' || output.charAt(i) === '{') {
            count++;
        }
        if (output.charAt(i) === ')' || output.charAt(i) === ']' || output.charAt(i) === '}') {
            count--;
        }
    }
    // update the innerHTML of the webpage to an error message if there are missing parenthesis
    if (count != 0) {
        document.getElementById('evaluatedResult').innerHTML = 'Error! Please make sure that all your brackets and parentheses are paired.';
        return;
    }
    
    /***** PARSING THROUGH EXPRESSIONS ENCLOSED BY PARENTHESIS AND SENDING THEM TO CALCULATE() ******/
    // if there are parenthesis in output. If not, send the entire string expression to calculate()
    if (parenthesisRegex.test(output)) {
      //start by searching for the first open parenthesis
      startPos = output.search(openparenRegex);
      // while there are still parenthesis in the expression
      while (parenthesisRegex.test(output)) {
        // if the nearest parenthesis after startPos is a closed parenthesis, or if another open parenthesis does not exist,
        // substring the expression enclosed in parenthesis and send it to calculate()
        if (regexIndexOf(output, closeparenRegex, startPos + 1) < 
            regexIndexOf(output, openparenRegex, startPos + 1) || regexIndexOf(output, openparenRegex, startPos + 1) === -1) {
            endPos = regexIndexOf(output, closeparenRegex, startPos + 1) + 1;
            // create substring consisting of the expression enclosed in parenthesis
            let substring = output.substring(startPos, endPos);
            // send the expression to calculate
            let calculated = calculate(substring);
            // replace the enclosed expression with the result from calculate()
            output = output.replace(substring, calculated);
            //reset startPos - it will start looking for parenthesis from the beginning of the string again
            startPos = -1;
        }
        else {
          // if the nearest parenthesis after startPos is an open parenthesis, update startPos
          startPos = regexIndexOf(output, openparenRegex, startPos + 1);
        }
      }
    }
    output = calculate(output);
    // update innerHTML of the webpage;
    document.getElementById('evaluatedResult').innerHTML = `Equals: ${output}`;
}

