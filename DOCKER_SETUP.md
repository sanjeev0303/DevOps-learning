# Docker Hub Setup Guide

This guide explains how to set up Docker Hub credentials for the CI/CD pipeline in your GitHub repository.

## Prerequisites

1. **Docker Hub Account**: You need a Docker Hub account. Create one at [hub.docker.com](https://hub.docker.com) if you don't have one.
2. **Repository Access**: You need admin access to your GitHub repository to configure secrets.

## Step 1: Create Docker Hub Repository

1. Go to [Docker Hub](https://hub.docker.com)
2. Sign in to your account
3. Click "Create Repository"
4. Set repository name to `devops-learning`
5. Choose visibility (Public recommended for demo projects)
6. Click "Create"

## Step 2: Generate Docker Hub Access Token

1. Go to Docker Hub → Account Settings → Security
2. Click "New Access Token"
3. Enter a description: "GitHub Actions CI/CD"
4. Select permissions: "Read, Write, Delete"
5. Click "Generate"
6. **Copy the token immediately** (you won't see it again)

## Step 3: Configure GitHub Repository Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click "New repository secret"
4. Add the following secrets:

### Required Secrets

| Secret Name | Value | Description |
|------------|-------|-------------|
| `DOCKER_USERNAME` | Your Docker Hub username | Used for authentication |
| `DOCKER_PASSWORD` | Your Docker Hub access token | Used for authentication (NOT your password) |

### Adding Each Secret

1. Click "New repository secret"
2. Name: `DOCKER_USERNAME`
3. Secret: Enter your Docker Hub username
4. Click "Add secret"

Repeat for `DOCKER_PASSWORD` using the access token from Step 2.

## Step 4: Verify Configuration

1. Push changes to your main branch
2. Go to **Actions** tab in your GitHub repository
3. Check if the "Docker Build and Push" workflow runs successfully
4. Verify your Docker image appears on Docker Hub

## Alternative Setup (Without Secrets)

The current workflow is configured to work without secrets for development:

- **Username**: Uses `devops-learning` as default
- **Password**: Uses the same value as username (for demo purposes)
- **Registry**: Uses Docker Hub public registry

This allows the workflow to run without requiring secret configuration, but won't actually push to Docker Hub.

## Troubleshooting

### Common Issues

1. **401 Unauthorized**:
   - Check if Docker Hub credentials are correct
   - Ensure you're using an access token, not your password
   - Verify the access token has write permissions

2. **Repository not found**:
   - Ensure the Docker Hub repository exists
   - Check the repository name matches the workflow configuration

3. **Build fails**:
   - Check if your Dockerfile is valid
   - Ensure all required files are present in the repository
   - Review build logs for specific error messages

### Testing Locally

Before setting up CI/CD, test Docker operations locally:

```bash
# Build the image
docker build -t devops-learning .

# Test run the image
docker run -p 5000:5000 devops-learning

# Tag for Docker Hub (replace 'username' with your Docker Hub username)
docker tag devops-learning username/devops-learning:latest

# Push to Docker Hub (requires authentication)
docker push username/devops-learning:latest
```

## Security Best Practices

1. **Use Access Tokens**: Never use your Docker Hub password directly
2. **Limit Token Scope**: Create tokens with minimal required permissions
3. **Rotate Tokens**: Regularly update access tokens
4. **Monitor Usage**: Review Docker Hub access logs periodically
5. **Use Private Repositories**: For production applications, use private Docker repositories

## Next Steps

After setting up Docker Hub integration:

1. Configure automated testing before Docker builds
2. Set up staging and production environments
3. Implement semantic versioning for your Docker images
4. Add vulnerability scanning to your Docker images
5. Consider using Docker multi-stage builds for smaller production images

## Support

If you encounter issues:

1. Check the GitHub Actions logs for detailed error messages
2. Review Docker Hub activity logs
3. Ensure your Dockerfile builds successfully locally
4. Verify all secrets are configured correctly in GitHub

For more information, see:
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build and Push Action](https://github.com/docker/build-push-action)
