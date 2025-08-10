/**
 * Fix Related Bias Slugs
 * Converts related_bias_ids to related_bias_slugs in the database
 * 
 * Usage: node scripts/fix-related-slugs.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixRelatedSlugs() {
  console.log('🔧 Fixing Related Bias Slugs');
  console.log('=============================\n');

  try {
    // Get all biases with related_bias_ids
    const { data: biases, error: fetchError } = await supabase
      .from('cognitive_biases_library')
      .select('id, cb_id, related_bias_ids')
      .not('related_bias_ids', 'is', null);

    if (fetchError) throw fetchError;

    console.log(`Found ${biases.length} biases with related IDs to process\n`);

    let updated = 0;
    let errors = 0;

    // Process each bias
    for (const bias of biases) {
      try {
        // Skip if no related IDs
        if (!bias.related_bias_ids || bias.related_bias_ids.length === 0) {
          continue;
        }

        // Get the slugs for the related CB IDs
        const { data: relatedBiases, error: relatedError } = await supabase
          .from('cognitive_biases_library')
          .select('cb_id, slug')
          .in('cb_id', bias.related_bias_ids);

        if (relatedError) {
          console.error(`❌ Error fetching related biases for ${bias.cb_id}:`, relatedError.message);
          errors++;
          continue;
        }

        // Create slug array from the results
        const slugArray = relatedBiases.map(rb => rb.slug).filter(Boolean);

        // Update the bias with the slugs
        const { error: updateError } = await supabase
          .from('cognitive_biases_library')
          .update({ related_bias_slugs: slugArray })
          .eq('id', bias.id);

        if (updateError) {
          console.error(`❌ Error updating ${bias.cb_id}:`, updateError.message);
          errors++;
        } else {
          console.log(`✅ Updated ${bias.cb_id}: ${bias.related_bias_ids.length} IDs → ${slugArray.length} slugs`);
          updated++;
        }
      } catch (error) {
        console.error(`❌ Unexpected error processing ${bias.cb_id}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Summary');
    console.log('==========');
    console.log(`✅ Successfully updated: ${updated}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📱 Total processed: ${biases.length}`);

    // Verify the fix
    const { data: checkData } = await supabase
      .from('cognitive_biases_library')
      .select('cb_id, related_bias_ids, related_bias_slugs')
      .not('related_bias_ids', 'is', null)
      .limit(3);

    console.log('\n🔍 Sample verification (first 3):');
    checkData.forEach(item => {
      console.log(`${item.cb_id}:`);
      console.log(`  IDs: [${item.related_bias_ids.join(', ')}]`);
      console.log(`  Slugs: [${item.related_bias_slugs.join(', ')}]`);
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the fix
fixRelatedSlugs().then(() => {
  console.log('\n🎉 Related slugs fixed successfully!');
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});