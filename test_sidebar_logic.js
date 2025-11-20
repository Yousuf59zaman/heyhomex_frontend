// Test script to verify the sidebar navigation logic
// This simulates the route matching functions from the refactored component

function isActiveRoute(path, currentPath) {
    if (!path || path === '#') return false

    // Handle dynamic route parameters (e.g., /kamaina/property/123 should match /kamaina/property)
    // Split paths into segments
    const currentSegments = currentPath.split('/').filter(segment => segment)
    const targetSegments = path.split('/').filter(segment => segment)

    // Exact match
    if (currentPath === path) return true

    // If target path has fewer segments, check if current path starts with target
    if (targetSegments.length <= currentSegments.length) {
        // Check if the first n segments match (where n is the length of target segments)
        for (let i = 0; i < targetSegments.length; i++) {
            // If segment matches, continue
            if (currentSegments[i] === targetSegments[i]) {
                continue
            }
            // If the current segment is a dynamic parameter (starts with ':'), it matches
            if (targetSegments[i].startsWith(':')) {
                continue
            }
            // If segment doesn't match and it's not a dynamic parameter, return false
            return false
        }
        return true
    }

    // Special case for dashboard (root path)
    if (path === "/kamaina" && (currentPath === path || currentPath === `${path}/index`)) return true

    return false
}

// Test cases
const testCases = [
    { currentPath: "/kamaina", targetPath: "/kamaina", expected: true, description: "Dashboard match" },
    { currentPath: "/kamaina/search", targetPath: "/kamaina/search", expected: true, description: "Search page match" },
    { currentPath: "/kamaina/search", targetPath: "/kamaina", expected: true, description: "Parent route match" },
    { currentPath: "/kamaina/property/123", targetPath: "/kamaina/property", expected: true, description: "Dynamic parameter match" },
    { currentPath: "/kamaina/videos", targetPath: "/kamaina/videos", expected: true, description: "Videos page match" },
    { currentPath: "/military", targetPath: "/military", expected: true, description: "Military dashboard match" },
    { currentPath: "/military/search", targetPath: "/military", expected: true, description: "Military parent route match" },
    { currentPath: "/investor", targetPath: "/investor", expected: true, description: "Investor dashboard match" },
    { currentPath: "/investor/settings", targetPath: "/investor/settings", expected: true, description: "Settings match" },
    { currentPath: "/kamaina", targetPath: "/military", expected: false, description: "Different user type mismatch" },
    { currentPath: "/kamaina/property/123", targetPath: "/kamaina/search", expected: false, description: "Different route mismatch" },
]

console.log("Testing sidebar navigation logic:\n")
let allPassed = true;

testCases.forEach((testCase, index) => {
    const result = isActiveRoute(testCase.targetPath, testCase.currentPath)
    const passed = result === testCase.expected
    console.log(`${index + 1}. ${testCase.description}`)
    console.log(`   Current: ${testCase.currentPath}, Target: ${testCase.targetPath}`)
    console.log(`   Expected: ${testCase.expected}, Got: ${result} - ${passed ? 'PASS' : 'FAIL'}\n`)
    if (!passed) allPassed = false
})

console.log(`\nOverall result: ${allPassed ? 'All tests PASSED' : 'Some tests FAILED'}`)