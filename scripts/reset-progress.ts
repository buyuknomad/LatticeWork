import * as fs from 'fs';

// Script to reset your embedding progress after deleting columns
// This will clean up your progress file so the embedding script starts fresh

const progressFilePath = process.env.PROGRESS_FILE_PATH || './db_embedding_progress.json';

function resetEmbeddingProgress() {
  console.log('🧹 Resetting embedding progress after column deletion...\n');
  
  // Check if progress file exists
  if (fs.existsSync(progressFilePath)) {
    console.log(`📄 Found existing progress file: ${progressFilePath}`);
    
    // Create backup
    const backupPath = `${progressFilePath}.backup.${new Date().toISOString().replace(/[:.]/g, '-')}`;
    try {
      fs.copyFileSync(progressFilePath, backupPath);
      console.log(`💾 Created backup: ${backupPath}`);
    } catch (error: any) {
      console.warn(`⚠️  Could not create backup: ${error.message}`);
    }
    
    // Delete the progress file
    try {
      fs.unlinkSync(progressFilePath);
      console.log(`✅ Deleted progress file: ${progressFilePath}`);
    } catch (error: any) {
      console.error(`❌ Could not delete progress file: ${error.message}`);
      return;
    }
  } else {
    console.log(`📄 No existing progress file found at: ${progressFilePath}`);
  }
  
  console.log('\n🎉 Progress reset complete!');
  console.log('\n📋 Next steps:');
  console.log('1. ✅ Run the SQL script to delete and recreate embedding columns');
  console.log('2. ✅ Run your embedding generation script:');
  console.log('   npx tsx populate_embeddings.ts');
  console.log('3. ✅ Run verification script to confirm results');
  console.log('\nYour embedding script will now start completely fresh! 🚀');
}

// Run the reset
resetEmbeddingProgress();