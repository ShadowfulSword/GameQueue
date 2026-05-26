================================================================
Running unit tests
================================================================
    Firstly ensure you have pytst installed via either installing the requirement docs or by running the following in your terminal:

        pip install pytest

    Navigate to GameQueue/backed/ and in your terminal run:

        pytest test_gamequeue.py -v 
    
    to run the system test_gamequeue

    In the same directory run the follolwing in your terminal:

        pytest test_integration.py -v 
    
    to run the integration tests