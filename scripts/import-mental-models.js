#!/bin/bash
# bulk-import.sh - Import all mental model batches

echo "Starting bulk import of all mental model batches..."

# Loop through all batch files
for i in {1..30}; do
    batch_file="batches/batch-$i.md"
    
    if [ -f "$batch_file" ]; then
        echo "Importing batch $i..."
        node scripts/import-mental-models.js $i "$batch_file"
        
        # Optional: Add delay between batches to avoid rate limits
        sleep 2
    else
        echo "Skipping batch $i - file not found: $batch_file"
    fi
done

echo "Bulk import completed!"

# Verify the results
echo "Verifying import..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

supabase.from('mental_models_library').select('count').then(({data, error}) => {
    if (error) console.error('Error:', error);
    else console.log('Total models imported:', data.length);
});
"