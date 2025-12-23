# ---------- Build Stage ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests clean package

# ---------- Runtime Stage ----------
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/attendance-1.0.0.jar app.jar

ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Bind Spring Boot to Railway's provided PORT
CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
