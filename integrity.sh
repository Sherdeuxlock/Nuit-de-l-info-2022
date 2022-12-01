function print_csum {
    echo $1: `cat $1 | openssl dgst -sha384 -binary | openssl base64 -A`
}

for file in $(find $1 -type f)
do
    print_csum $file
done