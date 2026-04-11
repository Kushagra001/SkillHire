const { MongoClient } = require('mongodb');
async function run() {
    const client = new MongoClient('mongodb://localhost:27017/skillhire');
    try {
        await client.connect();
        const db = client.db('skillhire');
        
        const total = await db.collection('jobs').countDocuments({ is_active: true });
        const withTags = await db.collection('jobs').countDocuments({ is_active: true, tags: { $regex: /Batch/i } });
        const withBatchField = await db.collection('jobs').countDocuments({ is_active: true, batch: { $exists: true, $not: { $size: 0 } } });
        
        console.log(`Total active jobs: ${total}`);
        console.log(`Jobs with "Batch" in tags: ${withTags}`);
        console.log(`Jobs with non-empty "batch" field: ${withBatchField}`);
        
        const sampleBatch = await db.collection('jobs').find({ is_active: true, batch: { $exists: true, $not: { $size: 0 } } }).limit(3).toArray();
        console.log('Sample batch data:', JSON.stringify(sampleBatch.map(j => ({ title: j.title, batch: j.batch, tags: j.tags })), null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}
run();
