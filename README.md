CVSS Score Predictor

SPE Final Project: CVSS Score Predictor

1. Overview
  This project aims to predict the Common Vulnerability Scoring System (CVSS) scores for cybersecurity vulnerabilities using machine learning techniques. The CVSS provides a standardized method for rating the severity of security         vulnerabilities, assisting organizations in prioritizing their responses.

2. Features
 - Machine Learning Model: Utilizes natural language processing (NLP) to analyze vulnerability descriptions and predict CVSS scores.
 - Modular Architecture: Comprises separate components for frontend, backend, machine learning service, and infrastructure management.
 - Deployment Ready: Includes configurations for Docker, Kubernetes, and Jenkins to facilitate seamless deployment and continuous integration/continuous deployment (CI/CD) pipelines.

3. Prerequisites
  - Docker
  - Kubernetes
  - Ansible
  - Jenkins

4. Installation
  - Clone the repository:
      git clone https://github.com/Sengar001/CVSS_score_predictor.git
      cd CVSS_score_predictor
  - Set up the environment:
      Use Ansible playbooks in the ansible/ directory to configure necessary environments.
  - Deploy services using Docker Compose:
      docker-compose up --build
  - For Kubernetes deployment, apply the configurations in the k8s/ directory:
      kubectl apply -f k8s/
  - Configure Jenkins:
      Use the provided Jenkinsfile to set up CI/CD pipelines.

5. Usage
  Once deployed, the application will be accessible via the configured frontend interface. Users can input vulnerability descriptions, and the system will output predicted CVSS scores based on the trained machine learning model.
