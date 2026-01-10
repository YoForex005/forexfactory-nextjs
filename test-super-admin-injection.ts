/**
 * Comprehensive Test for Super Admin Blog Injection
 * Tests all edge cases to ensure title and SEO work perfectly
 */

async function testSuperAdminInjection() {
    const baseUrl = 'http://localhost:3005';
    const apiEndpoint = `${baseUrl}/api/super-admin/inject`;

    console.log('🧪 TESTING SUPER ADMIN BLOG INJECTION\n');
    console.log('='.repeat(60));

    // Test cases with different scenarios
    const testCases = [
        {
            name: 'Test 1: Valid h1 and meta_title',
            payload: {
                h1: 'Ultimate Guide to Forex Trading with AI',
                meta_title: 'Forex Trading AI Guide - Complete Tutorial',
                meta_description: 'Learn how to use AI for forex trading with step-by-step instructions and expert tips.',
                body_html: '<h1>Ultimate Guide to Forex Trading with AI</h1><p>This is a comprehensive guide...</p>',
                primary_keyword: 'forex trading AI',
                secondary_keywords: ['forex', 'AI trading', 'automated trading'],
                post_status: 'Publish',
                download_link: 'https://example.com/download/forex-ai-bot.zip',
                featured_image: 'https://pub-9fc60e9b8d334d298b6a4a22f06229c0.r2.dev/test-image.webp',
                author: 'John Smith'
            },
            expectedTitle: 'Ultimate Guide to Forex Trading with AI',
            expectedSeoTitle: 'Forex Trading AI Guide - Complete Tutorial'
        },
        {
            name: 'Test 2: Empty h1 (should fallback to "Untitled AI Blog")',
            payload: {
                h1: '',
                meta_title: '',
                meta_description: 'This blog has no title but should still work.',
                body_html: '<p>Content without a title</p>',
                post_status: 'Publish'
            },
            expectedTitle: 'Untitled AI Blog',
            expectedSeoTitle: 'Untitled AI Blog'
        },
        {
            name: 'Test 3: Whitespace-only h1 (should fallback)',
            payload: {
                h1: '   ',
                meta_title: '   ',
                meta_description: 'Testing whitespace handling.',
                body_html: '<p>Content with whitespace title</p>',
                post_status: 'Publish'
            },
            expectedTitle: 'Untitled AI Blog',
            expectedSeoTitle: 'Untitled AI Blog'
        },
        {
            name: 'Test 4: No h1 but has meta_title',
            payload: {
                meta_title: 'SEO Title Without H1',
                meta_description: 'This only has meta title, no h1.',
                body_html: '<p>Content without h1 tag</p>',
                post_status: 'Draft'
            },
            expectedTitle: 'Untitled AI Blog',
            expectedSeoTitle: 'SEO Title Without H1'
        },
        {
            name: 'Test 5: h1 with special characters',
            payload: {
                h1: 'How to Trade EUR/USD: The Ultimate Guide (2024)',
                meta_title: 'EUR/USD Trading Guide 2024',
                meta_description: 'Master EUR/USD trading with our comprehensive guide.',
                body_html: '<h1>How to Trade EUR/USD: The Ultimate Guide (2024)</h1><p>Trading guide...</p>',
                secondary_keywords: ['EUR/USD', 'forex pairs', 'currency trading'],
                post_status: 'Publish'
            },
            expectedTitle: 'How to Trade EUR/USD: The Ultimate Guide (2024)',
            expectedSeoTitle: 'EUR/USD Trading Guide 2024'
        }
    ];

    const testResults = [];
    const createdBlogIds = [];

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n📝 ${testCase.name}`);
        console.log('-'.repeat(60));

        try {
            // Make API request
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testCase.payload)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                console.log('❌ FAILED: API returned error');
                console.log('Response:', result);
                testResults.push({ test: testCase.name, status: 'FAILED', error: result.error || 'Unknown error' });
                continue;
            }

            console.log('✅ Blog created successfully');
            console.log('   Blog ID:', result.blogId);
            console.log('   Slug:', result.slug);

            createdBlogIds.push(result.blogId);

            // Verify the blog was created correctly
            const verifyResponse = await fetch(`${baseUrl}/api/blogs?id=${result.blogId}`);

            if (!verifyResponse.ok) {
                console.log('⚠️  WARNING: Could not verify blog (API might not have this endpoint)');
                testResults.push({ test: testCase.name, status: 'PARTIAL', note: 'Created but not verified' });
                continue;
            }

            const verifyData = await verifyResponse.json();

            // Check title
            const actualTitle = verifyData.title;
            const titleMatch = actualTitle === testCase.expectedTitle;

            console.log(`   Expected Title: "${testCase.expectedTitle}"`);
            console.log(`   Actual Title:   "${actualTitle}"`);
            console.log(`   Title Match: ${titleMatch ? '✅' : '❌'}`);

            // Check SEO meta
            if (verifyData.seoMeta && verifyData.seoMeta.length > 0) {
                const actualSeoTitle = verifyData.seoMeta[0].seoTitle;
                const seoTitleMatch = actualSeoTitle === testCase.expectedSeoTitle;

                console.log(`   Expected SEO Title: "${testCase.expectedSeoTitle}"`);
                console.log(`   Actual SEO Title:   "${actualSeoTitle}"`);
                console.log(`   SEO Title Match: ${seoTitleMatch ? '✅' : '❌'}`);

                const hasCleanDescription = verifyData.seoMeta[0].seoDescription &&
                    !verifyData.seoMeta[0].seoDescription.includes('<');
                console.log(`   SEO Description clean (no HTML): ${hasCleanDescription ? '✅' : '❌'}`);

                if (titleMatch && seoTitleMatch && hasCleanDescription) {
                    testResults.push({ test: testCase.name, status: 'PASSED' });
                } else {
                    testResults.push({ test: testCase.name, status: 'FAILED', reason: 'Data mismatch' });
                }
            } else {
                console.log('❌ No SEO meta found!');
                testResults.push({ test: testCase.name, status: 'FAILED', reason: 'No SEO meta' });
            }

        } catch (error) {
            console.log('❌ FAILED: Exception occurred');
            console.log('Error:', error instanceof Error ? error.message : String(error));
            testResults.push({ test: testCase.name, status: 'FAILED', error: error instanceof Error ? error.message : String(error) });
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const passed = testResults.filter(r => r.status === 'PASSED').length;
    const failed = testResults.filter(r => r.status === 'FAILED').length;
    const partial = testResults.filter(r => r.status === 'PARTIAL').length;

    testResults.forEach(result => {
        const icon = result.status === 'PASSED' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
        console.log(`${icon} ${result.test}: ${result.status}`);
        if (result.error || result.reason || result.note) {
            console.log(`   → ${result.error || result.reason || result.note}`);
        }
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`Total: ${testResults.length} | Passed: ${passed} | Failed: ${failed} | Partial: ${partial}`);
    console.log('='.repeat(60));

    if (passed === testResults.length) {
        console.log('\n🎉 ALL TESTS PASSED! Blog injection works perfectly!');
    } else if (failed === 0 && partial > 0) {
        console.log('\n✅ Tests completed (verification endpoint not available)');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the issues above.');
    }

    console.log(`\n📝 Created ${createdBlogIds.length} test blogs with IDs: ${createdBlogIds.join(', ')}`);
    console.log('   You can manually verify these blogs or clean them up from the database.');
}

// Run the test
testSuperAdminInjection().catch(console.error);
