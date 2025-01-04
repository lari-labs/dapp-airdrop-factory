#!/bin/zsh

# Create a temporary file to store modified JavaScript
temp_file=$(mktemp).cjs

# Create the CommonJS format
cat > $temp_file << EOF
const data = $(cat test_data.js)
console.log(JSON.stringify(data))
EOF

# Use Node.js to parse the JavaScript and output JSON
keys=($(node $temp_file | jq -r '.[0:100] | .[] | .pubkey.key'))

# Remove temporary file
rm $temp_file

# Counter for tracking progress
count=1

# Loop through each key and make the curl request
for key in $keys; do
    echo "\nRequest $count/100: Processing key: $key"
    
    # Construct the JSON payload
    json="{\"publicKey\":{\"key\":\"$key\"}}"
    
    # Make the curl request
    curl -X POST \
         -H "Content-Type: application/json" \
         -d "$json" \
         http://localhost:3000/api/verify-eligibility
    
    # Increment counter
    ((count++))
    
    # Add a small delay to prevent overwhelming the server
    sleep 0.5
    
    echo "\n-------------------"
done
