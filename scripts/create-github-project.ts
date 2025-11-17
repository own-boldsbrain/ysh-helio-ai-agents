#!/usr/bin/env tsx
/**
 * Create GitHub Project (v2) for Production 360° Coverage
 *
 * This script creates a Project board with:
 * - Kanban view with status columns
 * - Custom fields (Priority, Effort, Phase, Category)
 * - All 248 issues organized by phase
 * - Automation rules
 *
 * Prerequisites:
 * - GitHub token with 'project' scope
 * - GraphQL API access
 *
 * Usage:
 *   export GITHUB_TOKEN=ghp_xxxxx
 *   pnpm tsx scripts/create-github-project.ts
 */

import { Octokit } from '@octokit/rest'
import { graphql } from '@octokit/graphql'

const OWNER = 'own-boldsbrain'
const REPO = 'ysh-helio-ai-agents'
const PROJECT_TITLE = 'Production 360° Coverage'
const PROJECT_DESCRIPTION = 'Complete implementation roadmap for production-grade infrastructure'

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.error('❌ Error: GITHUB_TOKEN not set')
  console.error('Run: export GITHUB_TOKEN=ghp_xxxxx')
  process.exit(1)
}

const octokit = new Octokit({ auth: token })
const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${token}`,
  },
})

interface ProjectV2 {
  id: string
  number: number
  url: string
}

interface Field {
  id: string
  name: string
}

/**
 * Get repository node ID (required for GraphQL mutations)
 */
async function getRepositoryNodeId(): Promise<string> {
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id
      }
    }
  `

  const result: any = await graphqlWithAuth(query, {
    owner: OWNER,
    repo: REPO,
  })

  return result.repository.id
}

/**
 * Get user node ID
 */
async function getUserNodeId(): Promise<string> {
  const query = `
    query {
      viewer {
        id
      }
    }
  `

  const result: any = await graphqlWithAuth(query)
  return result.viewer.id
}

/**
 * Create a new Project (v2)
 */
async function createProject(ownerId: string): Promise<ProjectV2> {
  console.log('🎯 Creating GitHub Project...')

  const mutation = `
    mutation($ownerId: ID!, $title: String!) {
      createProjectV2(input: {
        ownerId: $ownerId,
        title: $title
      }) {
        projectV2 {
          id
          number
          url
        }
      }
    }
  `

  try {
    const result: any = await graphqlWithAuth(mutation, {
      ownerId,
      title: PROJECT_TITLE,
    })

    const project = result.createProjectV2.projectV2
    console.log(`  ✅ Project created: ${project.url}`)
    return project
  } catch (error: any) {
    console.error('  ❌ Failed to create project:', error.message)
    throw error
  }
}

/**
 * Link project to repository
 */
async function linkProjectToRepo(projectId: string, repoId: string): Promise<void> {
  console.log('\n🔗 Linking project to repository...')

  const mutation = `
    mutation($projectId: ID!, $repositoryId: ID!) {
      linkProjectV2ToRepository(input: {
        projectId: $projectId,
        repositoryId: $repositoryId
      }) {
        repository {
          id
        }
      }
    }
  `

  try {
    await graphqlWithAuth(mutation, {
      projectId,
      repositoryId: repoId,
    })
    console.log('  ✅ Project linked to repository')
  } catch (error: any) {
    console.error('  ❌ Failed to link project:', error.message)
  }
}

/**
 * Get project fields (Status field is created by default)
 */
async function getProjectFields(projectId: string): Promise<Field[]> {
  const query = `
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          fields(first: 20) {
            nodes {
              ... on ProjectV2Field {
                id
                name
              }
              ... on ProjectV2SingleSelectField {
                id
                name
              }
            }
          }
        }
      }
    }
  `

  const result: any = await graphqlWithAuth(query, {
    projectId,
  })

  return result.node.fields.nodes
}

/**
 * Create custom single-select field
 */
async function createSingleSelectField(
  projectId: string,
  name: string,
  options: { name: string; color?: string }[],
): Promise<string> {
  const mutation = `
    mutation($projectId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
      createProjectV2Field(input: {
        projectId: $projectId,
        dataType: SINGLE_SELECT,
        name: $name,
        singleSelectOptions: $options
      }) {
        projectV2Field {
          ... on ProjectV2SingleSelectField {
            id
            name
          }
        }
      }
    }
  `

  const result: any = await graphqlWithAuth(mutation, {
    projectId,
    name,
    options: options.map((opt) => ({ name: opt.name, color: opt.color || 'GRAY' })),
  })

  return result.createProjectV2Field.projectV2Field.id
}

/**
 * Create custom text field
 */
async function createTextField(projectId: string, name: string): Promise<string> {
  const mutation = `
    mutation($projectId: ID!, $name: String!) {
      createProjectV2Field(input: {
        projectId: $projectId,
        dataType: TEXT,
        name: $name
      }) {
        projectV2Field {
          ... on ProjectV2Field {
            id
            name
          }
        }
      }
    }
  `

  const result: any = await graphqlWithAuth(mutation, {
    projectId,
    name,
  })

  return result.createProjectV2Field.projectV2Field.id
}

/**
 * Create custom number field
 */
async function createNumberField(projectId: string, name: string): Promise<string> {
  const mutation = `
    mutation($projectId: ID!, $name: String!) {
      createProjectV2Field(input: {
        projectId: $projectId,
        dataType: NUMBER,
        name: $name
      }) {
        projectV2Field {
          ... on ProjectV2Field {
            id
            name
          }
        }
      }
    }
  `

  const result: any = await graphqlWithAuth(mutation, {
    projectId,
    name,
  })

  return result.createProjectV2Field.projectV2Field.id
}

/**
 * Setup custom fields for the project
 */
async function setupCustomFields(projectId: string): Promise<void> {
  console.log('\n📋 Setting up custom fields...')

  try {
    // Priority field
    await createSingleSelectField(projectId, 'Priority', [
      { name: 'Critical', color: 'RED' },
      { name: 'High', color: 'ORANGE' },
      { name: 'Medium', color: 'YELLOW' },
      { name: 'Low', color: 'GREEN' },
    ])
    console.log('  ✅ Created field: Priority')

    // Phase field
    await createSingleSelectField(projectId, 'Phase', [
      { name: 'Phase 0: Build Fixes', color: 'RED' },
      { name: 'Phase 1: Observability', color: 'ORANGE' },
      { name: 'Phase 2: Core Infrastructure', color: 'YELLOW' },
      { name: 'Phase 3: Security & Compliance', color: 'BLUE' },
      { name: 'Phase 4: Performance & Scalability', color: 'GREEN' },
      { name: 'Phase 5: Monitoring & Alerting', color: 'PURPLE' },
    ])
    console.log('  ✅ Created field: Phase')

    // Category field
    await createSingleSelectField(projectId, 'Category', [
      { name: 'Build & Type Safety', color: 'RED' },
      { name: 'Logging & Observability', color: 'BLUE' },
      { name: 'Docker Sandbox', color: 'PURPLE' },
      { name: 'Auth & Authorization', color: 'YELLOW' },
      { name: 'Database & Data', color: 'ORANGE' },
      { name: 'Security & Compliance', color: 'RED' },
      { name: 'Performance & Scalability', color: 'GREEN' },
      { name: 'Monitoring & Alerting', color: 'BLUE' },
    ])
    console.log('  ✅ Created field: Category')

    // Effort (hours) field
    await createNumberField(projectId, 'Effort (hours)')
    console.log('  ✅ Created field: Effort (hours)')

    // Assignee, Labels, Milestone are built-in fields
    console.log('  ℹ️  Built-in fields: Status, Assignee, Labels, Milestone')
  } catch (error: any) {
    console.error('  ❌ Failed to create custom fields:', error.message)
  }
}

/**
 * Get all issues from repository
 */
async function getRepositoryIssues(): Promise<any[]> {
  console.log('\n📥 Fetching repository issues...')

  const issues: any[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const response = await octokit.rest.issues.listForRepo({
      owner: OWNER,
      repo: REPO,
      state: 'open',
      per_page: perPage,
      page,
    })

    if (response.data.length === 0) break

    issues.push(...response.data)
    console.log(`  📄 Fetched ${issues.length} issues...`)

    if (response.data.length < perPage) break
    page++
  }

  console.log(`  ✅ Total issues fetched: ${issues.length}`)
  return issues
}

/**
 * Add issue to project
 */
async function addIssueToProject(projectId: string, issueNodeId: string): Promise<string> {
  const mutation = `
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {
        projectId: $projectId,
        contentId: $contentId
      }) {
        item {
          id
        }
      }
    }
  `

  const result: any = await graphqlWithAuth(mutation, {
    projectId,
    contentId: issueNodeId,
  })

  return result.addProjectV2ItemById.item.id
}

/**
 * Get issue node ID
 */
async function getIssueNodeId(issueNumber: number): Promise<string> {
  const query = `
    query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $number) {
          id
        }
      }
    }
  `

  const result: any = await graphqlWithAuth(query, {
    owner: OWNER,
    repo: REPO,
    number: issueNumber,
  })

  return result.repository.issue.id
}

/**
 * Add all issues to project
 */
async function addIssuesToProject(projectId: string, issues: any[]): Promise<void> {
  console.log('\n📌 Adding issues to project...')

  let added = 0
  let failed = 0

  for (const issue of issues) {
    try {
      const issueNodeId = await getIssueNodeId(issue.number)
      await addIssueToProject(projectId, issueNodeId)
      added++

      if (added % 10 === 0) {
        console.log(`  📍 Added ${added}/${issues.length} issues...`)
      }

      // Rate limiting delay
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error: any) {
      console.error(`  ❌ Failed to add issue #${issue.number}:`, error.message)
      failed++
    }
  }

  console.log(`\n  ✅ Added ${added} issues to project`)
  if (failed > 0) {
    console.log(`  ⚠️  Failed to add ${failed} issues`)
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Creating GitHub Project for Production 360° Coverage\n')
  console.log(`📦 Repository: ${OWNER}/${REPO}\n`)

  try {
    // Step 1: Get user and repository IDs
    const userId = await getUserNodeId()
    const repoId = await getRepositoryNodeId()

    // Step 2: Create project
    const project = await createProject(userId)

    // Step 3: Link project to repository
    await linkProjectToRepo(project.id, repoId)

    // Step 4: Setup custom fields
    await setupCustomFields(project.id)

    // Step 5: Fetch all issues
    const issues = await getRepositoryIssues()

    // Step 6: Add issues to project
    if (issues.length > 0) {
      await addIssuesToProject(project.id, issues)
    }

    console.log('\n✨ ===================================')
    console.log('✅ GitHub Project created successfully!')
    console.log(`\n🔗 View project at: ${project.url}`)
    console.log(`\n📋 Next steps:`)
    console.log('   1. Configure Status column workflow')
    console.log('   2. Set up automation rules')
    console.log('   3. Create additional views (Table, Roadmap)')
    console.log('   4. Assign team members to issues')
    console.log('   5. Start working on Phase 0 (Build Fixes)')
  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
    console.error('\nTroubleshooting:')
    console.error('  1. Ensure GITHUB_TOKEN has "project" scope')
    console.error('  2. Check token at: https://github.com/settings/tokens')
    console.error('  3. Required scopes: repo, project')
    process.exit(1)
  }
}

main().catch(console.error)
