# Git Configuration for Multiple Email Addresses

This document explains how to configure Git to automatically use different email addresses based on repository hosting service (GitHub, Bitbucket, etc.) or individual repositories.

## Problem
When working with multiple Git hosting services, you want to use:
- GitHub email for GitHub repositories
- Bitbucket/Atlassian email for Bitbucket repositories  
- Work email for all other repositories

## Solution Approaches

### Approach 1: URL-based Conditional Configuration (Git 2.36+)

For newer Git versions, you can configure email addresses based on remote URLs.

#### Setup
1. Create configuration files for each service:
```bash
mkdir -p ~/.config/git

# GitHub configuration
cat > ~/.config/git/github << EOF
[user]
    name = Your Name
    email = your-github@email.com
EOF

# Bitbucket configuration  
cat > ~/.config/git/bitbucket << EOF
[user]
    name = Your Name
    email = your-bitbucket@email.com
EOF
```

2. Configure global Git settings:
```bash
# Set default email (for other repos)
git config --global user.name "Your Name"
git config --global user.email "your-work@email.com"

# Add conditional includes based on remote URLs
git config --global includeIf.'hasconfig:remote.*.url:*github.com*'.path "~/.config/git/github"
git config --global includeIf.'hasconfig:remote.*.url:*bitbucket.org*'.path "~/.config/git/bitbucket"
```

#### Verification
```bash
# Check configuration
git config --list | grep -E "(user\.|includeIf)"

# Test in a specific repository
cd /path/to/your/repo
git config user.email  # Should show the appropriate email
```

### Approach 2: Directory-based Conditional Configuration

Organize repositories by hosting service in separate directories.

#### Setup
1. Create directory structure:
```bash
mkdir -p ~/code/github
mkdir -p ~/code/bitbucket
mkdir -p ~/code/work
```

2. Create service-specific configurations:
```bash
# GitHub repos configuration
cat > ~/.config/git/github << EOF
[user]
    name = Your Name
    email = your-github@email.com
EOF

# Bitbucket repos configuration
cat > ~/.config/git/bitbucket << EOF
[user]
    name = Your Name
    email = your-bitbucket@email.com
EOF
```

3. Configure global Git settings:
```bash
# Set default email
git config --global user.name "Your Name"
git config --global user.email "your-work@email.com"

# Add directory-based conditional includes
git config --global includeIf.'gitdir:~/code/github/'.path "~/.config/git/github"
git config --global includeIf.'gitdir:~/code/bitbucket/'.path "~/.config/git/bitbucket"
```

4. Clone repositories in appropriate directories:
```bash
# GitHub repositories
cd ~/code/github
git clone git@github.com:username/repo.git

# Bitbucket repositories  
cd ~/code/bitbucket
git clone git@bitbucket.org:username/repo.git
```

### Approach 3: Manual Per-Repository Configuration

Set email addresses manually for each repository when automatic configuration doesn't work.

#### Setup
```bash
# Navigate to repository
cd /path/to/your/repo

# Set email for GitHub repositories
git config user.email "your-github@email.com"

# Set email for Bitbucket repositories
git config user.email "your-bitbucket@email.com"

# Verify
git config user.email
```

#### Bulk Configuration Script
Create a script to configure multiple repositories:

```bash
#!/bin/bash
# configure-repos.sh

# GitHub repositories
for repo in ~/code/github/*/; do
    if [ -d "$repo/.git" ]; then
        cd "$repo"
        git config user.email "your-github@email.com"
        echo "Configured $(basename "$repo") for GitHub"
    fi
done

# Bitbucket repositories
for repo in ~/code/bitbucket/*/; do
    if [ -d "$repo/.git" ]; then
        cd "$repo"
        git config user.email "your-bitbucket@email.com"
        echo "Configured $(basename "$repo") for Bitbucket"
    fi
done
```

## Git Version Management

### Check Current Version
```bash
git --version
```

### Update Git

#### macOS
```bash
# Using Homebrew (recommended)
brew install git
# or update existing installation
brew upgrade git

# Using Xcode Command Line Tools
xcode-select --install

# Using MacPorts
sudo port selfupdate
sudo port install git

# Verify new version (may need to restart terminal)
which git
git --version
```

#### Windows
```bash
# Using Git for Windows installer
# Download from: https://git-scm.com/download/win

# Using Chocolatey
choco upgrade git

# Using Winget
winget upgrade Git.Git

# Using Scoop
scoop update git
```

#### Linux

##### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install latest Git
sudo apt install git

# For newer versions, add Git PPA
sudo add-apt-repository ppa:git-core/ppa
sudo apt update
sudo apt install git
```

##### CentOS/RHEL/Fedora
```bash
# CentOS/RHEL
sudo yum update git
# or
sudo dnf update git

# Fedora
sudo dnf install git

# For newer versions, compile from source
sudo yum groupinstall "Development Tools"
sudo yum install gettext-devel openssl-devel perl-CPAN perl-devel zlib-devel
wget https://github.com/git/git/archive/v2.45.0.tar.gz
tar -xzf v2.45.0.tar.gz
cd git-2.45.0
make configure
./configure --prefix=/usr/local
make all
sudo make install
```

##### Arch Linux
```bash
sudo pacman -S git
```

## Troubleshooting

### Check Effective Configuration
```bash
# Show all configuration and sources
git config --list --show-origin

# Show user configuration for current repository
git config user.name
git config user.email

# Show where configuration is coming from
git config --show-origin user.email
```

### Common Issues

1. **Configuration not taking effect**: Restart terminal or source shell configuration
2. **Wrong email still showing**: Check for local repository configuration overriding global settings
3. **Conditional includes not working**: Verify Git version supports the feature and paths are correct

### Reset Configuration
```bash
# Remove all conditional includes
git config --global --remove-section includeIf

# Reset to default
git config --global user.email "your-default@email.com"
```

## Current Repository Configuration

This repository (`webgl`) is configured with:
- **Name**: Sahil Agnihotri  
- **Email**: sahilagnihotri@ymail.com (GitHub email)
- **Global Default**: sahil@myvr-software.com (work email)

## Best Practices

1. **Test configuration** after setup in each repository
2. **Document your setup** for team members
3. **Use consistent naming** across configurations
4. **Backup your Git configuration** before making changes:
   ```bash
   cp ~/.gitconfig ~/.gitconfig.backup
   ```
5. **Verify commits** before pushing to ensure correct email is used