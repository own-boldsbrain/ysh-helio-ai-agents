# Java Specialized Sandbox Image
# Optimized for Java development with Maven and Gradle

FROM eclipse-temurin:21-jdk-jammy

# Install system dependencies and development tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    git \
    openssh-client \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (for full-stack Java projects)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g pnpm yarn typescript tsx

# Install Maven with caching
ENV MAVEN_VERSION=3.9.6
RUN wget https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz \
    && tar xzf apache-maven-${MAVEN_VERSION}-bin.tar.gz -C /opt \
    && rm apache-maven-${MAVEN_VERSION}-bin.tar.gz \
    && ln -s /opt/apache-maven-${MAVEN_VERSION} /opt/maven

# Install Gradle with caching
ENV GRADLE_VERSION=8.5
RUN wget https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip \
    && unzip gradle-${GRADLE_VERSION}-bin.zip -d /opt \
    && rm gradle-${GRADLE_VERSION}-bin.zip \
    && ln -s /opt/gradle-${GRADLE_VERSION} /opt/gradle

# Set environment variables
ENV MAVEN_HOME=/opt/maven \
    GRADLE_HOME=/opt/gradle \
    PATH="${PATH}:/opt/maven/bin:/opt/gradle/bin"

# Pre-download Maven and Gradle wrappers for caching
RUN --mount=type=cache,target=/root/.m2 \
    --mount=type=cache,target=/root/.gradle \
    mkdir -p /tmp/maven-init && cd /tmp/maven-init \
    && mvn --version \
    && gradle --version \
    && cd / && rm -rf /tmp/maven-init

# Configure git
RUN git config --global init.defaultBranch main \
    && git config --global --add safe.directory /workspace/project

# Set working directory
WORKDIR /workspace

# Configure Java environment
ENV JAVA_OPTS="-Xmx2g -XX:+UseG1GC" \
    MAVEN_OPTS="-Dmaven.repo.local=/root/.m2/repository" \
    GRADLE_USER_HOME=/root/.gradle

# Expose common ports
EXPOSE 3000 8080 8443 9090

# Keep container running
CMD ["tail", "-f", "/dev/null"]
