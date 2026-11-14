# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY jc-sales-agent/pom.xml ./pom.xml
COPY jc-sales-agent/src ./src
RUN mvn -B -DskipTests package
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN groupadd --gid 10001 app && useradd --uid 10001 --gid app --no-create-home app
COPY --from=build --chown=app:app /build/target/jc-sales-agent-1.0.0.jar /app/app.jar
USER app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
