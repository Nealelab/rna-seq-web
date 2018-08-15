# RNA-seq-web

A web tool for browsing publicly available RNA-seq datasets and derived co-expression networks.
[Here](http://35.190.17.251) is a running instance with brain data.

## Development

Want to contribute in developing the website? Awesome.

### Clone the repo

```
git clone https://github.com/Nealelab/rna-seq-web
cd rna-seq-web
```

### Install requirements

Install Python packages (you should have Python 3 and pip3 installed):  
```
pip3 install -r requirements.txt
```

If you don't have Node, [install it](https://nodejs.org/en/download/).

Install npm packages:  
```
npm install
```

### Run webpack

Run webpack in watch mode so it recreates the JavaScript bundle every time you make changes to the sources:  
```
node_modules/webpack/bin/webpack.js --config webpack.dev.js --watch
```
The bundle file appears in `static/bundle.js`

### Run a development server

To use the Flask dev server:  
```
export FLASK_ENV=development
python3 app.py
```

### Develop

To work on the Flask backend, start from [app.py](app.py).
To work on the React frontend, start from [js/app.js](js/app.js).

## Deployment in Google Cloud

First, install [Docker](https://docs.docker.com/install/), [Cloud SDK](https://cloud.google.com/sdk/downloads) and [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/).

### Create a Docker image

```
docker build -t gcr.io/DESIRED/TAG:VERSION -f docker/Dockerfile .
```
Replace DESIRED TAG VERSION with the desired tag and version.

Push the image to Google Container Registry:  
```
gcloud docker -- push gcr.io/DESIRED/TAG:VERSION
```

### Authenticate to Google Cloud

```
gcloud auth login
```

### Create a container cluster

```
gcloud container clusters create rna-seq-web --num-nodes=1 --machine-type=n1-standard-1 --zone=us-east1-b
```

The application currently keeps all data in RAM - the machine type should have enough memory for this.
Currently a regular 1 CPU / 3.75 GB machine is enough when one worker thread is used.

### Set up Kubernetes

Create a static, global IP address to use:  
```
gcloud compute addresses create whatever-ip --global
```
And change `kubernetes.io/ingress.global-static-ip-name` in [k8s/ingress.yaml](k8s/ingress.yaml) to `whatever-ip`.

Change the disk (pdName) in [k8s/pv.yaml](k8s/pv.yaml) to one with the wanted data files.
Also make sure the disk size ("storage" attributes) is the actual size.
Make sure [config.py](config.py) matches the locations of the data on the disk.

Change `image` in [k8s/ss.yaml](k8s/ss.yaml) to the Docker image you created.
Change the `memory` attributes as needed.
Make sure `mountPath` matches the data locations in [config.py](config.py) and that `storage` is the correct size.

Finally, create the Kubernetes setup:  

```
kubectl apply -f k8s/ingress.yaml  
kubectl apply -f k8s/pv.yaml  
kubectl apply -f k8s/ss.yaml
```

After `kubectl get pods` shows a running pod, visit the IP address you created (use `kubectl get ingress` to find the address).
For Kubernetes troubles, try `kubectl get events --sort-by=.metadata.creationTimestamp`, `kubectl describe pod PODNAME`, and `kubectl logs PODNAME`, where PODNAME is the pod name from `kubectl get pods`.
