class BinaryExtension {
    static asBinarySequence(arr) {
        let result = 0b0;
        for (let i = 0; i < arr.length; i++)
            result += arr[i] << (arr.length - i - 1);
        return result;
    }
}
