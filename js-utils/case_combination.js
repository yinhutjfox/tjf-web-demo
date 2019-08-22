function case_combination(target) {
    let resultSet = [];
    if (target && 'string' === typeof target) {
        let castTag = [];
        for (let i in target) {
            castTag.push(false);
        }

        function make_string() {
            let tmpString = '';
            for (let i in target) {
                if (null === castTag[i]) {
                    tmpString += target[i];
                } else if (castTag[i]) {
                    tmpString += target[i].toLowerCase();
                } else {
                    tmpString += target[i].toUpperCase();
                }
            }
            return tmpString;
        }

        function make_combination(index, boolean_array) {
            if (index < boolean_array.length) {
                if (null === target[index].match('[a-zA-z]')) {
                    castTag[index] = null;
                    make_combination(index + 1, boolean_array);
                    if (index + 1 === boolean_array.length) {
                        resultSet.push(make_string());
                    }
                } else {
                    for(let tag of [true, false]) {
                        castTag[index] = tag;
                        make_combination(index + 1, boolean_array);
                        if (index + 1 === boolean_array.length) {
                            resultSet.push(make_string());
                        }
                    }
                }
            }
        }

        make_combination(0, castTag);
    }
    return resultSet;
}

if("undefined" !== typeof(exports)) {
    exports.case_combination = case_combination
}